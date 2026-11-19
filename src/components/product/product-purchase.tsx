"use client";

import { Check, Heart, MapPin, ShieldCheck, Truck, Undo2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { Coupon, Product, ProductVariant } from "@/data";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Price } from "@/components/ui/price";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { COMMERCE } from "@/lib/config";
import { formatDeliveryWindow, formatINR } from "@/lib/format";
import { useCartStore } from "@/store/cart-store";
import { toast } from "@/store/toast-store";
import { useWishlistStore } from "@/store/wishlist-store";

interface ProductPurchaseProps {
  product: Product;
  coupons: Coupon[];
  merchantName?: string;
}

function firstAvailable(variants: ProductVariant[]) {
  return variants.find((variant) => variant.stock > 0) ?? variants[0];
}

export function ProductPurchase({ product, coupons, merchantName }: ProductPurchaseProps) {
  const firstVariant = firstAvailable(product.variants);
  const [color, setColor] = useState(firstVariant?.color ?? product.colors[0]?.name ?? "");
  const [size, setSize] = useState(firstVariant?.size ?? "");
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const [checkedPincode, setCheckedPincode] = useState("");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const wished = useWishlistStore((state) => state.productIds.includes(product.id));
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const selectedVariant = useMemo(
    () => product.variants.find((variant) => variant.color === color && variant.size === size),
    [product.variants, color, size],
  );
  const stock = selectedVariant?.stock ?? 0;
  const unitPrice = product.price;
  const discount = product.mrp > unitPrice ? product.mrp - unitPrice : 0;
  const lowStock = stock > 0 && stock <= 5;

  function chooseColor(nextColor: string) {
    setColor(nextColor);
    const sameSize = product.variants.find((variant) => variant.color === nextColor && variant.size === size && variant.stock > 0);
    const next = sameSize ?? product.variants.find((variant) => variant.color === nextColor && variant.stock > 0);
    if (next) setSize(next.size);
  }

  function addToBag() {
    if (!selectedVariant || stock <= 0) {
      toast.error("Choose an available size", { description: "Select a colour and size that is in stock." });
      return;
    }
    if (quantity > stock) {
      toast.error("Quantity exceeds available stock", { description: `Only ${stock} available in this size and colour.` });
      return;
    }
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      merchantId: product.merchantId,
      slug: product.slug,
      merchantName,
      name: product.name,
      imageId: product.imageIds[0] ?? "placeholder:product",
      color: selectedVariant.color,
      size: selectedVariant.size,
      unitPrice,
      mrp: product.mrp,
      quantity,
      stock: selectedVariant.stock,
    });
    toast.success("Added to your bag", { description: `${product.name} · ${selectedVariant.color}, ${selectedVariant.size}` });
  }

  function checkPincode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^[1-9]\d{5}$/.test(pincode)) {
      setCheckedPincode("");
      toast.error("Enter a valid 6-digit pincode");
      return;
    }
    setCheckedPincode(pincode);
  }

  async function copyCoupon(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`${code} copied`);
    } catch (error) {
      console.error("Could not copy coupon code.", error);
      toast.error("Could not copy the code", { description: "Please select and copy it manually." });
    }
  }

  const deliveryStart = new Date();
  deliveryStart.setDate(deliveryStart.getDate() + COMMERCE.deliveryDays.min);
  const deliveryEnd = new Date();
  deliveryEnd.setDate(deliveryEnd.getDate() + COMMERCE.deliveryDays.max);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-2">Colour</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a colour">
          {product.colors.map((option) => (
            <button
              key={option.name}
              type="button"
              onClick={() => chooseColor(option.name)}
              aria-pressed={color === option.name}
              className="flex min-h-11 items-center gap-2 rounded-ui border px-3 text-sm transition-colors aria-pressed:border-indigo aria-pressed:bg-indigo/5"
            >
              <span className="size-4 rounded-full border border-ink/15" style={{ backgroundColor: option.hex }} />
              {option.name}
              {color === option.name ? <Check aria-hidden className="size-4 text-indigo" /> : null}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="eyebrow">Select size</p>
          <button type="button" onClick={() => setSizeGuideOpen(true)} className="min-h-11 text-xs text-indigo underline underline-offset-4">Size guide</button>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a size">
          {product.sizes.map((option) => {
            const variant = product.variants.find((item) => item.color === color && item.size === option);
            const available = Boolean(variant?.stock);
            return (
              <button
                key={option}
                type="button"
                disabled={!available}
                onClick={() => setSize(option)}
                aria-pressed={size === option}
                aria-label={`${option}${available ? "" : ", out of stock"}`}
                className="min-h-11 min-w-12 rounded-ui border px-3 text-sm transition-colors aria-pressed:border-indigo aria-pressed:bg-indigo aria-pressed:text-ivory disabled:cursor-not-allowed disabled:line-through disabled:opacity-40"
              >
                {option}
              </button>
            );
          })}
        </div>
        <p className="mt-2 min-h-5 text-xs text-muted" aria-live="polite">
          {!selectedVariant ? "Choose an available size." : stock <= 0 ? "Currently out of stock in this size." : lowStock ? `Only ${stock} left in this size.` : "In stock and ready to ship."}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div>
          <p className="eyebrow mb-2">Quantity</p>
          <QuantityStepper value={quantity} onChange={setQuantity} max={Math.min(COMMERCE.maxQuantityPerItem, Math.max(stock, 1))} disabled={stock === 0} />
        </div>
        <div className="flex-1">
          <Price price={unitPrice} mrp={product.mrp} size="lg" showTaxNote />
          {discount > 0 ? <p className="mt-1 text-xs text-success">You save {formatINR(discount)} on this piece</p> : null}
        </div>
      </div>

      <div className="hidden gap-3 sm:flex">
        <Button size="lg" fullWidth disabled={!stock} onClick={addToBag}>Add to bag</Button>
        <button type="button" onClick={() => toggleWishlist(product.id)} aria-pressed={wished} aria-label={wished ? "Remove from wishlist" : "Add to wishlist"} className="grid size-12 shrink-0 place-items-center border border-line text-indigo transition-colors hover:bg-indigo/5 aria-pressed:text-burgundy">
          <Heart aria-hidden className={`size-5 ${wished ? "fill-current" : ""}`} />
        </button>
      </div>

      <form onSubmit={checkPincode} className="border-y border-line py-4">
        <label htmlFor="delivery-pincode" className="eyebrow mb-2 flex items-center gap-2"><MapPin aria-hidden className="size-4 text-gold-ink" /> Check delivery estimate</label>
        <div className="flex gap-2">
          <input id="delivery-pincode" inputMode="numeric" autoComplete="postal-code" maxLength={6} value={pincode} onChange={(event) => setPincode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Enter 6-digit pincode" className="min-h-11 min-w-0 flex-1 border border-line bg-ivory px-3 text-sm outline-none focus:border-indigo" />
          <Button type="submit" variant="ghost" size="sm">Check</Button>
        </div>
        {checkedPincode ? <p className="mt-2 text-sm text-ink" role="status">Estimated arrival to {checkedPincode}: {formatDeliveryWindow(deliveryStart, deliveryEnd)}. Confirmed at checkout.</p> : null}
      </form>

      {coupons.length ? (
        <section aria-labelledby="product-offers-heading">
          <h2 id="product-offers-heading" className="eyebrow mb-3">Offers for you</h2>
          <ul className="space-y-2">
            {coupons.slice(0, 3).map((coupon) => (
              <li key={coupon.id} className="flex items-center justify-between gap-3 border border-line bg-pearl/60 p-3">
                <div>
                  <p className="text-sm font-medium text-ink">{coupon.code}</p>
                  <p className="text-xs text-muted">{coupon.description}</p>
                </div>
                <button type="button" onClick={() => void copyCoupon(coupon.code)} className="min-h-11 shrink-0 px-2 text-xs font-medium uppercase tracking-wide text-indigo underline underline-offset-4">Copy</button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <ul className="grid grid-cols-1 gap-3 text-xs text-muted sm:grid-cols-3">
        <li className="flex items-center gap-2"><Truck aria-hidden className="size-4 text-gold-ink" /> Delivery in 3–7 days</li>
        <li className="flex items-center gap-2"><Undo2 aria-hidden className="size-4 text-gold-ink" /> 7-day eligible returns</li>
        <li className="flex items-center gap-2"><ShieldCheck aria-hidden className="size-4 text-gold-ink" /> Secure checkout</li>
      </ul>

      <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 flex items-center gap-3 border-t border-line bg-ivory/95 px-4 py-3 shadow-float backdrop-blur sm:hidden">
        <button type="button" onClick={() => toggleWishlist(product.id)} aria-pressed={wished} aria-label={wished ? "Remove from wishlist" : "Add to wishlist"} className="grid size-11 shrink-0 place-items-center border border-line text-indigo aria-pressed:text-burgundy">
          <Heart aria-hidden className={`size-5 ${wished ? "fill-current" : ""}`} />
        </button>
        <Button fullWidth size="md" disabled={!stock} onClick={addToBag}>Add to bag · {formatINR(unitPrice * quantity)}</Button>
      </div>

      <Dialog open={sizeGuideOpen} onOpenChange={setSizeGuideOpen} title="Size guide" description="A starting point for finding your usual fit.">
        <p className="mb-4 text-sm text-muted">These body measurements are indicative. Garment measurements vary by style; use the fit note above if you are between sizes.</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead><tr className="border-b border-line text-xs uppercase tracking-wide text-muted"><th className="p-2">Size</th><th className="p-2">Chest (in)</th><th className="p-2">Waist (in)</th></tr></thead>
            <tbody>{[["XS", "34–36", "28–30"], ["S", "36–38", "30–32"], ["M", "38–40", "32–34"], ["L", "40–42", "34–36"], ["XL", "42–44", "36–38"], ["XXL", "44–46", "38–40"]].map((row) => <tr key={row[0]} className="border-b border-line"><th scope="row" className="p-2 font-medium">{row[0]}</th><td className="p-2">{row[1]}</td><td className="p-2">{row[2]}</td></tr>)}</tbody>
          </table>
        </div>
      </Dialog>
    </div>
  );
}
