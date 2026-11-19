"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaImage } from "@/components/ui/media-image";
import { checkoutAddressSchema, checkoutPaymentSchema, checkoutSchema } from "@/lib/checkout-schema";
import { gstRateFor } from "@/lib/config";
import type { AdminSettings } from "@/lib/admin-store";
import { formatINR } from "@/lib/format";
import { groupCartItems, useCartStore } from "@/store/cart-store";
import type { Coupon } from "@/data";
import {
  CheckoutAddressStep,
  CheckoutConflictList,
  CheckoutDeliveryStep,
  CheckoutPaymentStep,
  CheckoutReviewStep,
  type CheckoutAddress,
  type CheckoutConflict,
  type CheckoutPaymentMethod,
  type CheckoutPaymentDetails,
} from "./checkout-steps";

type AddressFields = CheckoutAddress;

const stepNames = ["Address", "Delivery", "Payment", "Review"] as const;
export function CheckoutFlow({ initialAddress, coupons, settings }: { initialAddress?: Partial<AddressFields>; coupons: Coupon[]; settings: AdminSettings }) {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const couponCode = useCartStore((state) => state.couponCode);
  const updateItem = useCartStore((state) => state.updateItem);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const clearCart = useCartStore((state) => state.clear);
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState<AddressFields>({
    name: initialAddress?.name ?? "",
    email: initialAddress?.email ?? "",
    phone: initialAddress?.phone ?? "",
    line1: initialAddress?.line1 ?? "",
    line2: initialAddress?.line2 ?? "",
    city: initialAddress?.city ?? "",
    state: initialAddress?.state ?? "",
    pincode: initialAddress?.pincode ?? "",
  });
  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>("upi");
  const [paymentDetails, setPaymentDetails] = useState<CheckoutPaymentDetails>({ vpa: "", cardNumber: "", expiry: "", cvv: "", bank: "" });
  const [paymentOutcome, setPaymentOutcome] = useState<"success" | "failure">("success");
  const [errors, setErrors] = useState<string[]>([]);
  const [conflicts, setConflicts] = useState<CheckoutConflict[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const groups = useMemo(() => groupCartItems(items), [items]);
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const activeCoupon = coupons.find((item) => item.code === couponCode);
  const couponEligibleSubtotal = items.reduce((sum, item) => {
    if (activeCoupon?.merchantId && item.merchantId !== activeCoupon.merchantId) return sum;
    return sum + item.unitPrice * item.quantity;
  }, 0);
  const discount = activeCoupon
    ? Math.min(couponEligibleSubtotal, activeCoupon.discountType === "percentage"
      ? Math.min(Math.round(couponEligibleSubtotal * activeCoupon.discountValue / 100), activeCoupon.maxDiscount ?? Number.MAX_SAFE_INTEGER)
      : activeCoupon.discountValue)
    : 0;
  const couponInvalid = Boolean(couponCode && (!activeCoupon || couponEligibleSubtotal < activeCoupon.minimumSpend));
  const shipping = deliveryMethod === "express" ? settings.standardShippingFee * 2 : subtotal - discount >= settings.freeDeliveryThreshold ? 0 : settings.standardShippingFee;
  const gstIncluded = items.reduce((sum, item) => {
    const unitPrice = item.unitPrice;
    const rate = gstRateFor(unitPrice, settings.gstSlabs);
    const gross = unitPrice * item.quantity;
    const lineDiscount = activeCoupon && (!activeCoupon.merchantId || activeCoupon.merchantId === item.merchantId) && couponEligibleSubtotal
      ? Math.round(discount * gross / couponEligibleSubtotal)
      : 0;
    return sum + Math.round((gross - lineDiscount) * rate / (100 + rate));
  }, 0);
  const total = subtotal - discount + shipping;
  const staleLines = items.filter((item) => item.stock !== undefined && item.stock < item.quantity);

  function setAddressField(key: keyof AddressFields, value: string) {
    setAddress((current) => ({ ...current, [key]: value }));
  }

  function validateCurrentStep() {
    setErrors([]);
    if (step === 0) {
      const result = checkoutAddressSchema.safeParse(address);
      if (!result.success) {
        setErrors(result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`));
        return false;
      }
    }
    if (step === 2) {
      const payment = paymentMethod === "upi"
        ? { method: "upi" as const, vpa: paymentDetails.vpa }
        : paymentMethod === "card"
          ? { method: "card" as const, cardNumber: paymentDetails.cardNumber.replace(/\s/g, ""), expiry: paymentDetails.expiry, cvv: paymentDetails.cvv }
          : paymentMethod === "netbanking"
            ? { method: "netbanking" as const, bank: paymentDetails.bank }
            : { method: "cod" as const };
      const result = checkoutPaymentSchema.safeParse(payment);
      if (!result.success) {
        setErrors(result.error.issues.map((issue) => issue.message));
        return false;
      }
    }
    return true;
  }

  function nextStep() {
    if (!validateCurrentStep()) return;
    setStep((current) => Math.min(stepNames.length - 1, current + 1));
  }

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payment = paymentMethod === "upi"
      ? { method: "upi" as const, vpa: paymentDetails.vpa }
      : paymentMethod === "card"
        ? { method: "card" as const, cardNumber: paymentDetails.cardNumber.replace(/\s/g, ""), expiry: paymentDetails.expiry, cvv: paymentDetails.cvv }
        : paymentMethod === "netbanking"
          ? { method: "netbanking" as const, bank: paymentDetails.bank }
          : { method: "cod" as const };
    const payload = {
      address,
      deliveryMethod,
      payment,
      paymentOutcome,
      couponCode,
      items: items.map((item) => ({ productId: item.productId, variantId: item.variantId, quantity: item.quantity, expectedPrice: item.unitPrice })),
    };
    const parsed = checkoutSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(parsed.error.issues.map((issue) => issue.message));
      return;
    }
    if (couponInvalid) {
      setErrors(["The saved coupon is no longer active or eligible. Remove it from your bag and review the total."]);
      return;
    }
    setSubmitting(true);
    setErrors([]);
    setConflicts([]);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await response.json() as { orderId?: string; error?: string; conflicts?: CheckoutConflict[] };
      if (response.status === 409 && result.conflicts) {
        setConflicts(result.conflicts);
        for (const conflict of result.conflicts) {
          const item = items.find((line) => line.variantId === conflict.variantId);
          if (!item) continue;
          if (conflict.kind === "price") {
            updateItem(item.variantId, { unitPrice: conflict.currentPrice ?? item.unitPrice, priceConfirmed: true });
          }
          if (conflict.kind === "stock" || conflict.kind === "out_of_stock") {
            const available = conflict.available ?? 0;
            if (available > 0) {
              updateItem(item.variantId, { stock: available });
              setQuantity(item.variantId, Math.min(item.quantity, available));
            }
            else setQuantity(item.variantId, 0);
          }
          if (conflict.kind === "unavailable") setQuantity(item.variantId, 0);
        }
        setErrors([result.error ?? "Your bag changed. Review the updated items."]);
        setStep(3);
        return;
      }
      if (!response.ok || !result.orderId) {
        setErrors([result.error ?? "We could not place the order. Please try again."]);
        return;
      }
      clearCart();
      router.push(`/order/${encodeURIComponent(result.orderId)}/confirmation`);
    } catch (error) {
      console.error("Could not submit mock checkout.", error);
      setErrors(["We could not reach checkout. Your bag is unchanged; please try again."]);
    } finally {
      setSubmitting(false);
    }
  }

  if (!items.length) return <div className="border border-line p-8 text-center"><h1 className="display-md text-indigo">Your bag is empty</h1><p className="mt-2 text-sm text-muted">Add a piece before starting checkout.</p><Link href="/shop" className="mt-4 inline-flex min-h-11 items-center text-indigo underline">Explore the collection</Link></div>;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.8fr)]">
      <div>
        <ol aria-label="Checkout progress" className="mb-8 grid grid-cols-4 border-b border-line">
          {stepNames.map((name, index) => <li key={name}><button type="button" onClick={() => index < step && setStep(index)} aria-current={index === step ? "step" : undefined} disabled={index > step} className={`min-h-12 w-full border-b-2 px-1 text-[11px] uppercase tracking-wide sm:text-xs ${step === index ? "border-indigo font-medium text-indigo" : index < step ? "border-gold text-ink" : "border-transparent text-muted"}`}>{index + 1}. {name}</button></li>)}
        </ol>
        <form onSubmit={placeOrder} noValidate>
          {step === 0 ? <CheckoutAddressStep address={address} setAddressField={setAddressField} /> : null}
          {step === 1 ? <CheckoutDeliveryStep method={deliveryMethod} setMethod={setDeliveryMethod} /> : null}
          {step === 2 ? <CheckoutPaymentStep method={paymentMethod} setMethod={(method) => { setPaymentMethod(method); if (method === "cod") setPaymentOutcome("success"); }} details={paymentDetails} setDetails={setPaymentDetails} outcome={paymentOutcome} setOutcome={setPaymentOutcome} /> : null}
          {step === 3 ? <CheckoutReviewStep address={address} method={deliveryMethod} payment={paymentMethod} items={items} /> : null}
          {errors.length ? <div role="alert" className="mt-5 border border-danger/30 bg-danger/5 p-4 text-sm text-danger"><ul className="list-inside list-disc space-y-1">{errors.map((error) => <li key={error}>{error}</li>)}</ul></div> : null}
          {conflicts.length ? <CheckoutConflictList conflicts={conflicts} /> : null}
          <div className="mt-7 flex flex-wrap justify-between gap-3">
            <Button type="button" variant="ghost" leftIcon={<ArrowLeft aria-hidden className="size-4" />} onClick={() => step === 0 ? router.push("/cart") : setStep((current) => current - 1)}> {step === 0 ? "Back to bag" : "Back"} </Button>
            {step < 3 ? <Button type="button" rightIcon={<ArrowRight aria-hidden className="size-4" />} onClick={nextStep}>Continue</Button> : <Button type="submit" loading={submitting} disabled={Boolean(staleLines.length)} leftIcon={<ShieldCheck aria-hidden className="size-4" />}>Place order · {formatINR(total)}</Button>}
          </div>
          {step === 3 && staleLines.length ? <p className="mt-3 text-sm text-danger">Resolve item price or stock changes in your bag before placing the order.</p> : null}
          {step === 3 && couponInvalid ? <p className="mt-3 text-sm text-danger">The coupon is no longer eligible. Return to your bag to remove it.</p> : null}
        </form>
      </div>
      <aside className="border border-line p-5 lg:sticky lg:top-6">
        <h2 className="display-md mb-4 text-indigo">Order summary</h2>
        <ul className="mb-4 space-y-3">{groups.flatMap((group) => group.items.map((item) => (
          <li key={item.variantId} className="flex items-center gap-3"><div className="w-12 shrink-0"><MediaImage src={item.imageId} alt="" ratio="4/5" sizes="48px" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm text-ink">{item.name}</p><p className="text-xs text-muted">{item.color} · {item.size} · Qty {item.quantity}</p></div><span className="text-xs">{formatINR(item.unitPrice * item.quantity)}</span></li>
        )))}</ul>
        <dl className="space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatINR(subtotal)}</dd></div>
          {discount ? <div className="flex justify-between text-success"><dt>Offer ({activeCoupon?.code ?? couponCode})</dt><dd>−{formatINR(discount)}</dd></div> : couponCode ? <p className="text-xs text-danger">Coupon {couponCode} is no longer active. Remove it from your bag to continue.</p> : null}
          <div className="flex justify-between"><dt>Delivery</dt><dd>{shipping ? formatINR(shipping) : "Complimentary"}</dd></div>
          <div className="flex justify-between text-xs text-muted"><dt>GST included</dt><dd>{formatINR(gstIncluded)}</dd></div>
          <div className="flex justify-between border-t border-line pt-3 font-medium"><dt>Total</dt><dd>{formatINR(total)}</dd></div>
        </dl>
        {staleLines.length ? <p className="mt-4 flex gap-2 text-xs text-danger"><AlertTriangle aria-hidden className="size-4 shrink-0" />Resolve {staleLines.length} stock or price update{staleLines.length > 1 ? "s" : ""} in your bag.</p> : null}
      </aside>
    </div>
  );
}
