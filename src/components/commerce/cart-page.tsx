"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { Coupon } from "@/data";
import { MediaImage } from "@/components/ui/media-image";
import { Price } from "@/components/ui/price";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { gstRateFor } from "@/lib/config";
import type { AdminSettings } from "@/lib/admin-store";
import { discountPercent, formatINR } from "@/lib/format";
import { groupCartItems, useCartStore } from "@/store/cart-store";
import { toast } from "@/store/toast-store";
import { useWishlistStore } from "@/store/wishlist-store";

export function CartPage({ coupons, settings }: { coupons: Coupon[]; settings: AdminSettings }) {
  const items = useCartStore((state) => state.items);
  const couponCode = useCartStore((state) => state.couponCode);
  const setCouponCode = useCartStore((state) => state.setCouponCode);
  const removeItem = useCartStore((state) => state.removeItem);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const [couponInput, setCouponInput] = useState(couponCode);
  const groups = useMemo(() => groupCartItems(items), [items]);
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const activeCoupon = coupons.find((coupon) => coupon.code === couponCode);
  const couponEligibleSubtotal = items.reduce((sum, item) => {
    if (activeCoupon?.merchantId && item.merchantId !== activeCoupon.merchantId) return sum;
    return sum + item.unitPrice * item.quantity;
  }, 0);
  const couponDiscount = activeCoupon
    ? Math.min(couponEligibleSubtotal, activeCoupon.discountType === "percentage"
      ? Math.min(Math.round(couponEligibleSubtotal * activeCoupon.discountValue / 100), activeCoupon.maxDiscount ?? Number.MAX_SAFE_INTEGER)
      : activeCoupon.discountValue)
    : 0;
  const shipping = subtotal - couponDiscount >= settings.freeDeliveryThreshold ? 0 : settings.standardShippingFee;
  const total = subtotal - couponDiscount + shipping;
  const amountToFreeDelivery = Math.max(0, settings.freeDeliveryThreshold - (subtotal - couponDiscount));
  const hasConflicts = items.some((item) => item.stock !== undefined && item.stock < item.quantity);
  const gstIncluded = items.reduce((sum, item) => {
    const unitPrice = item.unitPrice;
    const rate = gstRateFor(unitPrice, settings.gstSlabs);
    const gross = unitPrice * item.quantity;
    const lineDiscount = activeCoupon && (!activeCoupon.merchantId || activeCoupon.merchantId === item.merchantId) && couponEligibleSubtotal
      ? Math.round(couponDiscount * gross / couponEligibleSubtotal)
      : 0;
    return sum + Math.round((gross - lineDiscount) * rate / (100 + rate));
  }, 0);

  function applyCoupon() {
    const coupon = coupons.find((candidate) => candidate.code.toLowerCase() === couponInput.trim().toLowerCase());
    if (!coupon) {
      setCouponCode("");
      toast.error("Coupon unavailable", { description: "Check the code or review the current offers." });
      return;
    }
    const eligibleSubtotal = items.reduce((sum, item) => {
      if (coupon.merchantId && item.merchantId !== coupon.merchantId) return sum;
      return sum + item.unitPrice * item.quantity;
    }, 0);
    if (eligibleSubtotal < coupon.minimumSpend) {
      toast.error("Minimum spend not met", { description: `This offer needs a bag subtotal of ${formatINR(coupon.minimumSpend)}.` });
      return;
    }
    setCouponCode(coupon.code);
    toast.success(`${coupon.code} applied`);
  }

  function moveToWishlist(productId: string, variantId: string) {
    if (!useWishlistStore.getState().productIds.includes(productId)) toggleWishlist(productId);
    removeItem(variantId);
    toast.success("Saved to your wishlist");
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <ShoppingBag aria-hidden className="mx-auto size-10 text-gold-ink" />
        <h2 className="display-lg mt-5 text-indigo">Your bag is taking a quiet moment</h2>
        <p className="mt-3 text-sm text-muted">Explore considered clothing from SELVARQ and independent Indian makers.</p>
        <Link href="/shop" className="mt-6 inline-flex min-h-11 items-center justify-center bg-indigo px-6 text-xs font-medium uppercase tracking-wide text-ivory">Explore the collection</Link>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(18rem,0.8fr)]">
      <div className="space-y-7">
        {amountToFreeDelivery > 0 ? (
          <section aria-label="Free delivery progress" className="border border-line bg-pearl/60 p-4">
            <p className="text-sm text-ink">Add <strong>{formatINR(amountToFreeDelivery)}</strong> for complimentary delivery.</p>
            <div className="mt-3 h-2 overflow-hidden bg-line"><div className="h-full bg-gold transition-[width] duration-300" style={{ width: `${Math.min(100, (subtotal - couponDiscount) / settings.freeDeliveryThreshold * 100)}%` }} /></div>
            <p className="caption mt-2">Complimentary delivery from {formatINR(settings.freeDeliveryThreshold)}</p>
          </section>
        ) : <p className="border border-success/30 bg-success/5 p-3 text-sm text-success">Complimentary delivery unlocked.</p>}

        {hasConflicts ? <div role="alert" className="flex gap-3 border border-danger/30 bg-danger/5 p-4 text-sm text-danger"><AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0" /><p>Some items have a stock or price update. Review each flagged item before checkout.</p></div> : null}

        {groups.map((group) => {
          const merchantName = group.items[0]?.merchantName ?? "SELVARQ maker";
          return (
            <section key={group.merchantId} aria-labelledby={`merchant-${group.merchantId}`} className="border border-line">
              <h2 id={`merchant-${group.merchantId}`} className="border-b border-line bg-pearl px-4 py-3 text-xs font-medium uppercase tracking-brand text-indigo">{merchantName}</h2>
              <ul className="divide-y divide-line">
                {group.items.map((item) => {
                  const availableStock = item.stock;
                  const insufficientStock = availableStock !== undefined && (availableStock < item.quantity || availableStock === 0);
                  const href = item.slug ? `/product/${item.slug}` : "/shop";
                  return (
                    <li key={item.variantId} className="grid grid-cols-[5.5rem_1fr] gap-4 p-4 sm:grid-cols-[7rem_1fr_auto]">
                      <Link href={href} className="block self-start"><MediaImage src={item.imageId} alt={item.name} ratio="4/5" sizes="112px" /></Link>
                      <div className="min-w-0">
                        <Link href={href} className="font-medium text-ink hover:text-indigo">{item.name}</Link>
                        <p className="mt-1 text-xs text-muted">{item.color} · Size {item.size}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="text-xs text-muted">{availableStock === undefined ? "" : availableStock > 0 ? `${availableStock} available` : "Out of stock"}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <QuantityStepper value={item.quantity} onChange={(quantity) => setQuantity(item.variantId, quantity)} max={Math.max(1, Math.min(10, availableStock ?? 10))} disabled={availableStock === 0} />
                          <button type="button" onClick={() => moveToWishlist(item.productId, item.variantId)} className="inline-flex min-h-11 items-center gap-1 text-xs text-indigo underline underline-offset-4"><Heart aria-hidden className="size-4" /> Move to wishlist</button>
                          <button type="button" onClick={() => removeItem(item.variantId)} aria-label={`Remove ${item.name}`} className="inline-flex min-h-11 items-center gap-1 text-xs text-muted underline underline-offset-4"><Trash2 aria-hidden className="size-4" /> Remove</button>
                        </div>
                        {insufficientStock ? <p role="alert" className="mt-2 text-xs text-danger">{availableStock ? `Only ${availableStock} left; lower the quantity to continue.` : "This size is out of stock. Choose another size on the product page or remove this item."}</p> : null}
                      </div>
                      <div className="col-start-2 text-right sm:col-start-3"><Price price={item.unitPrice} mrp={item.mrp} size="sm" /></div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <aside className="lg:sticky lg:top-6">
        <div className="border border-line p-5">
          <h2 className="display-md mb-5 text-indigo">Order summary</h2>
          <div className="mb-5 flex gap-2">
            <label htmlFor="cart-coupon" className="sr-only">Coupon code</label>
            <input id="cart-coupon" value={couponInput} onChange={(event) => setCouponInput(event.target.value)} placeholder="Coupon code" className="min-h-11 min-w-0 flex-1 border border-line bg-ivory px-3 text-sm uppercase outline-none focus:border-indigo" />
            <button type="button" onClick={applyCoupon} className="min-h-11 border border-indigo px-4 text-xs font-medium uppercase tracking-wide text-indigo">Apply</button>
          </div>
          {activeCoupon ? <p className="mb-4 text-xs text-success">{activeCoupon.code} applied · <button type="button" onClick={() => { setCouponCode(""); setCouponInput(""); }} className="underline">Remove</button></p> : null}
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-3"><dt>Subtotal</dt><dd>{formatINR(subtotal)}</dd></div>
            {couponDiscount > 0 ? <div className="flex justify-between gap-3 text-success"><dt>Offer savings</dt><dd>−{formatINR(couponDiscount)}</dd></div> : null}
            <div className="flex justify-between gap-3"><dt>Delivery</dt><dd>{shipping ? formatINR(shipping) : "Complimentary"}</dd></div>
            <div className="flex justify-between gap-3 text-xs text-muted"><dt>GST included in item prices</dt><dd>{formatINR(gstIncluded)}</dd></div>
            <div className="flex justify-between gap-3 border-t border-line pt-3 text-base font-medium text-ink"><dt>Total</dt><dd>{formatINR(total)}</dd></div>
          </dl>
          <Link href={hasConflicts ? "#cart-items" : "/checkout"} aria-disabled={hasConflicts} onClick={(event) => { if (hasConflicts) event.preventDefault(); }} className={`mt-5 flex min-h-12 items-center justify-center gap-2 bg-indigo px-5 text-xs font-medium uppercase tracking-wide text-ivory ${hasConflicts ? "pointer-events-none opacity-50" : "hover:bg-indigo-deep"}`}>
            Continue to checkout <ArrowRight aria-hidden className="size-4" />
          </Link>
          <p className="mt-3 text-center text-xs text-muted">Secure checkout · GST-inclusive prices</p>
          <Link href="/shop" className="mt-2 flex min-h-11 items-center justify-center text-xs text-indigo underline underline-offset-4">Continue shopping</Link>
          <p className="sr-only">Current savings: {discountPercent(subtotal, subtotal - couponDiscount)} percent.</p>
        </div>
      </aside>
    </div>
  );
}
