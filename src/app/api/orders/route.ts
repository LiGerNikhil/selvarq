import { NextResponse, type NextRequest } from "next/server";
import { merchants, products, type Coupon } from "@/data";
import { getSession } from "@/lib/auth/demo-session";
import { COMMERCE, gstRateFor } from "@/lib/config";
import { checkoutSchema } from "@/lib/checkout-schema";
import { ordersRepository, couponsRepository } from "@/lib/repo";

interface CheckoutConflict {
  productId: string;
  variantId: string;
  kind: "unavailable" | "price" | "stock" | "out_of_stock";
  currentPrice?: number;
  available?: number;
}

export async function POST(request: NextRequest) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please correct the checkout details.", issues: parsed.error.flatten() }, { status: 400 });
  }

  const input = parsed.data;
  const currentLines = input.items.map((line) => {
    const product = products.find((item) => item.id === line.productId && item.status === "active");
    const variant = product?.variants.find((item) => item.id === line.variantId);
    return { requested: line, product, variant };
  });
  const conflicts = currentLines.flatMap<CheckoutConflict>(({ requested, product, variant }) => {
    if (!product || !variant) return [{ productId: requested.productId, variantId: requested.variantId, kind: "unavailable" as const }];
    const result: CheckoutConflict[] = [];
    if (product.price !== requested.expectedPrice) {
      result.push({ productId: product.id, variantId: variant.id, kind: "price" as const, currentPrice: product.price });
    }
    if (variant.stock < requested.quantity) {
      result.push({ productId: product.id, variantId: variant.id, kind: variant.stock > 0 ? "stock" as const : "out_of_stock" as const, available: variant.stock });
    }
    return result;
  });
  if (conflicts.length) {
    return NextResponse.json({ error: "Your bag has changed. Review the highlighted items before continuing.", conflicts }, { status: 409 });
  }

  const couponCode = input.couponCode.trim().toUpperCase();
  let coupon: Coupon | undefined;
  if (couponCode) {
    coupon = await couponsRepository.getByCode(couponCode);
    const active = coupon && (await couponsRepository.listActive()).some((item) => item.id === coupon?.id);
    const couponSubtotal = currentLines.reduce((sum, line) => {
      if (!line.product || !line.variant || (coupon?.merchantId && line.product.merchantId !== coupon.merchantId)) return sum;
      return sum + line.product.price * line.requested.quantity;
    }, 0);
    if (!coupon || !active || couponSubtotal < coupon.minimumSpend) {
      return NextResponse.json({ error: "This coupon is not valid for the items in your bag." }, { status: 422 });
    }
  }

  if (input.payment.method !== "cod" && input.paymentOutcome === "failure") {
    return NextResponse.json({ error: "The mock payment was declined. Your order has not been placed.", code: "PAYMENT_FAILED" }, { status: 402 });
  }

  const subtotal = currentLines.reduce((sum, line) => sum + (line.product?.price ?? 0) * line.requested.quantity, 0);
  const eligibleSubtotal = currentLines.reduce((sum, line) => {
    if (!line.product || (coupon?.merchantId && line.product.merchantId !== coupon.merchantId)) return sum;
    return sum + line.product.price * line.requested.quantity;
  }, 0);
  let discount = 0;
  if (coupon) {
    discount = coupon.discountType === "percentage"
      ? Math.round(eligibleSubtotal * coupon.discountValue / 100)
      : coupon.discountValue;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    discount = Math.min(discount, eligibleSubtotal);
  }
  const shipping = input.deliveryMethod === "express"
    ? COMMERCE.standardShippingFee * 2
    : subtotal - discount >= COMMERCE.freeDeliveryThreshold ? 0 : COMMERCE.standardShippingFee;
  const gstIncluded = currentLines.reduce((sum, line) => {
    if (!line.product) return sum;
    const gross = line.product.price * line.requested.quantity;
    const eligible = !coupon?.merchantId || coupon.merchantId === line.product.merchantId;
    const lineDiscount = eligible && eligibleSubtotal ? Math.round(discount * gross / eligibleSubtotal) : 0;
    const rate = gstRateFor(line.product.price);
    return sum + Math.round((gross - lineDiscount) * rate / (100 + rate));
  }, 0);
  const session = await getSession();
  const finalConflicts = currentLines.flatMap<CheckoutConflict>(({ requested, product, variant }) => {
    if (!product || !variant) return [{ productId: requested.productId, variantId: requested.variantId, kind: "unavailable" }];
    const result: CheckoutConflict[] = [];
    if (product.price !== requested.expectedPrice) result.push({ productId: product.id, variantId: variant.id, kind: "price", currentPrice: product.price });
    if (variant.stock < requested.quantity) result.push({
      productId: product.id,
      variantId: variant.id,
      kind: variant.stock > 0 ? "stock" : "out_of_stock",
      available: variant.stock,
    });
    return result;
  });
  if (finalConflicts.length) {
    return NextResponse.json({ error: "Your bag changed while checking out. Review the items before continuing.", conflicts: finalConflicts }, { status: 409 });
  }
  const userId = session?.role === "customer" ? session.userId : "guest";
  const orderId = `order-${crypto.randomUUID()}`;
  const orderNumber = `SVQ-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const items = currentLines.map(({ requested, product, variant }, index) => {
    if (!product || !variant) throw new Error("Validated checkout line lost its product or variant.");
    const sellerName = merchants.find((merchant) => merchant.id === product.merchantId)?.name ?? "SELVARQ Maker";
    return {
      productId: product.id,
      name: product.name,
      imageId: product.imageIds[0] ?? "placeholder:product",
      variantId: variant.id,
      quantity: requested.quantity,
      unitPrice: product.price,
      mrp: product.mrp,
      merchantId: product.merchantId,
      color: variant.color,
      size: variant.size,
      sellerName,
      gstRate: gstRateFor(product.price),
      lineId: `${orderId}-${index + 1}`,
    };
  });
  const merchantGroups = new Map<string, typeof items>();
  for (const item of items) {
    const group = merchantGroups.get(item.merchantId) ?? [];
    group.push(item);
    merchantGroups.set(item.merchantId, group);
  }
  let allocatedShipping = 0;
  const groupedOrders = [...merchantGroups];
  const merchantOrders = groupedOrders.map(([merchantId, lines], index) => {
    const sellerSubtotal = lines.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const sellerShipping = index === groupedOrders.length - 1
      ? shipping - allocatedShipping
      : Math.round(shipping * sellerSubtotal / subtotal);
    allocatedShipping += sellerShipping;
    return {
      merchantId,
      merchantName: lines[0]?.sellerName ?? "SELVARQ Maker",
      itemIds: lines.map((item) => item.variantId),
      subtotal: sellerSubtotal,
      shipping: sellerShipping,
      status: "confirmed" as const,
    };
  });
  const paymentMethodLabel = input.payment.method === "upi"
    ? "UPI"
    : input.payment.method === "card"
      ? "Card"
      : input.payment.method === "netbanking"
        ? "Net banking"
        : "Cash on delivery";
  const order = {
    id: orderId,
    orderNumber,
    userId,
    status: "confirmed",
    items,
    subtotal,
    discount,
    shipping,
    total: Math.max(0, subtotal - discount + shipping),
    paymentMethod: input.payment.method,
    paymentStatus: input.payment.method === "cod" ? "pending" : "paid",
    paymentReference: input.payment.method === "cod" ? undefined : `MOCK-${crypto.randomUUID().slice(0, 12).toUpperCase()}`,
    paymentMethodLabel,
    couponCode: coupon?.code,
    gstIncluded,
    address: input.address,
    deliveryMethod: input.deliveryMethod,
    merchantOrders,
    placedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } satisfies import("@/data").Order;
  for (const { requested, variant } of currentLines) {
    if (variant) variant.stock -= requested.quantity;
  }
  const createdOrder = await ordersRepository.create(order);

  return NextResponse.json({ orderId: createdOrder.id, orderNumber: createdOrder.orderNumber }, { status: 201 });
}
