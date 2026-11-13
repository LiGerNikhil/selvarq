import type { Order, OrderStatus, Product, User } from "./types";

const statuses: OrderStatus[] = [
  "delivered", "shipped", "processing", "confirmed", "pending",
  "delivered", "cancelled", "returned", "delivered", "shipped",
  "processing", "delivered", "confirmed", "delivered", "pending",
  "shipped", "cancelled", "delivered", "returned", "processing",
];
const paymentMethods: Order["paymentMethod"][] = ["upi", "card", "cod", "netbanking"];

export function createOrders(products: Product[], users: User[]): Order[] {
  return statuses.map((status, index): Order => {
    const product = products[(index * 7) % products.length];
    const quantity = index % 4 === 0 ? 2 : 1;
    const unitPrice = product.price;
    const discount = index % 5 === 0 ? Math.round(unitPrice * 0.1) : 0;
    const subtotal = unitPrice * quantity;
    const shipping = subtotal >= 199900 ? 0 : 9900;
    const item = {
      productId: product.id, name: product.name, imageId: product.imageIds[0],
      variantId: product.variants[(index * 3) % product.variants.length].id,
      quantity, unitPrice, mrp: product.mrp, merchantId: product.merchantId,
    };
    const placedAt = new Date(Date.UTC(2025, 0, 4 + index * 6)).toISOString();
    return {
      id: `order-${String(index + 1).padStart(3, "0")}`,
      orderNumber: `SVQ-25-${String(10021 + index).padStart(5, "0")}`,
      userId: users[index % 3].id,
      status,
      items: [item],
      subtotal,
      discount,
      shipping,
      total: Math.max(0, subtotal - discount + shipping),
      paymentMethod: paymentMethods[index % paymentMethods.length],
      paymentStatus: status === "pending" ? "pending" : status === "returned" || status === "cancelled" ? "refunded" : "paid",
      placedAt,
      updatedAt: new Date(Date.UTC(2025, 0, 5 + index * 6)).toISOString(),
      ...(status === "shipped" || status === "delivered" ? { trackingNumber: `INSEL${String(8200400000 + index)}` } : {}),
    };
  });
}
