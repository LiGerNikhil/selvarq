"use client";

import { ShieldCheck } from "lucide-react";
import type { CartItem } from "@/store/cart-store";
import type { CheckoutInput } from "@/lib/checkout-schema";

export type CheckoutAddress = CheckoutInput["address"];
export type CheckoutPaymentMethod = "upi" | "card" | "netbanking" | "cod";
export type CheckoutConflict = {
  productId: string;
  variantId: string;
  kind: "price" | "stock" | "out_of_stock" | "unavailable";
  currentPrice?: number;
  available?: number;
};

export interface CheckoutPaymentDetails {
  vpa: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  bank: string;
}

export function CheckoutAddressStep({ address, setAddressField }: {
  address: CheckoutAddress;
  setAddressField: (key: keyof CheckoutAddress, value: string) => void;
}) {
  const fields: { key: keyof CheckoutAddress; label: string; autocomplete: string }[] = [
    { key: "name", label: "Full name", autocomplete: "name" },
    { key: "email", label: "Email", autocomplete: "email" },
    { key: "phone", label: "Mobile number", autocomplete: "tel" },
    { key: "line1", label: "Address line 1", autocomplete: "address-line1" },
    { key: "line2", label: "Address line 2 (optional)", autocomplete: "address-line2" },
    { key: "city", label: "City", autocomplete: "address-level2" },
    { key: "state", label: "State", autocomplete: "address-level1" },
    { key: "pincode", label: "PIN code", autocomplete: "postal-code" },
  ];
  return (
    <section>
      <p className="eyebrow mb-2">Step 1</p>
      <h2 className="display-md mb-5 text-indigo">Delivery address</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <label key={field.key} className={`text-sm ${field.key === "line1" || field.key === "line2" ? "sm:col-span-2" : ""}`}>
            <span className="mb-1 block">{field.label}</span>
            <input autoComplete={field.autocomplete} value={address[field.key]} onChange={(event) => setAddressField(field.key, event.target.value)} className="min-h-11 w-full border border-line bg-ivory px-3 outline-none focus:border-indigo" />
          </label>
        ))}
      </div>
      <p className="caption mt-4">Checkout is available to guests. No account is required.</p>
    </section>
  );
}

export function CheckoutDeliveryStep({ method, setMethod }: {
  method: "standard" | "express";
  setMethod: (method: "standard" | "express") => void;
}) {
  const options = [
    ["standard", "Standard delivery", "3–7 business days", "Rs 99 or complimentary above Rs 1,999"],
    ["express", "Express delivery", "1–3 business days", "Rs 198"],
  ] as const;
  return (
    <section>
      <p className="eyebrow mb-2">Step 2</p>
      <h2 className="display-md mb-5 text-indigo">Choose delivery</h2>
      <div className="space-y-3">
        {options.map(([value, name, eta, price]) => (
          <label key={value} className={`flex cursor-pointer items-start gap-3 border p-4 ${method === value ? "border-indigo bg-indigo/5" : "border-line"}`}>
            <input type="radio" name="delivery" checked={method === value} onChange={() => setMethod(value)} className="mt-1 accent-indigo" />
            <span><strong className="block text-sm">{name}</strong><span className="mt-1 block text-xs text-muted">{eta} · {price}</span></span>
          </label>
        ))}
      </div>
      <p className="caption mt-4">Delivery estimate is confirmed after the PIN code is verified.</p>
    </section>
  );
}

export function CheckoutPaymentStep({ method, setMethod, details, setDetails, outcome, setOutcome }: {
  method: CheckoutPaymentMethod;
  setMethod: (method: CheckoutPaymentMethod) => void;
  details: CheckoutPaymentDetails;
  setDetails: (details: CheckoutPaymentDetails) => void;
  outcome: "success" | "failure";
  setOutcome: (outcome: "success" | "failure") => void;
}) {
  const tabs: { id: CheckoutPaymentMethod; label: string }[] = [
    { id: "upi", label: "UPI" }, { id: "card", label: "Card" },
    { id: "netbanking", label: "Net banking" }, { id: "cod", label: "Cash on delivery" },
  ];
  return (
    <section>
      <p className="eyebrow mb-2">Step 3</p>
      <h2 className="display-md mb-5 text-indigo">Payment method</h2>
      <div role="tablist" aria-label="Payment method" className="grid grid-cols-2 border-b border-line sm:grid-cols-4">
        {tabs.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={method === tab.id} onClick={() => setMethod(tab.id)} className={`min-h-11 border-b-2 px-2 text-xs ${method === tab.id ? "border-indigo text-indigo" : "border-transparent text-muted"}`}>{tab.label}</button>)}
      </div>
      <div className="min-h-32 py-5">
        {method === "upi" ? <label className="block max-w-sm text-sm">UPI ID<input value={details.vpa} onChange={(event) => setDetails({ ...details, vpa: event.target.value })} placeholder="name@bank" autoComplete="off" className="mt-1 min-h-11 w-full border border-line bg-ivory px-3" /></label> : null}
        {method === "card" ? (
          <div className="grid max-w-md gap-4 sm:grid-cols-2">
            <label className="text-sm sm:col-span-2">Card number<input inputMode="numeric" autoComplete="cc-number" maxLength={19} value={details.cardNumber} onChange={(event) => setDetails({ ...details, cardNumber: event.target.value.replace(/\D/g, "").slice(0, 16) })} className="mt-1 min-h-11 w-full border border-line bg-ivory px-3" /></label>
            <label className="text-sm">Expiry<input autoComplete="cc-exp" placeholder="MM/YY" maxLength={5} value={details.expiry} onChange={(event) => setDetails({ ...details, expiry: event.target.value })} className="mt-1 min-h-11 w-full border border-line bg-ivory px-3" /></label>
            <label className="text-sm">CVV<input inputMode="numeric" autoComplete="cc-csc" maxLength={4} value={details.cvv} onChange={(event) => setDetails({ ...details, cvv: event.target.value.replace(/\D/g, "").slice(0, 4) })} className="mt-1 min-h-11 w-full border border-line bg-ivory px-3" /></label>
          </div>
        ) : null}
        {method === "netbanking" ? <label className="block max-w-sm text-sm">Choose a bank<select value={details.bank} onChange={(event) => setDetails({ ...details, bank: event.target.value })} className="mt-1 min-h-11 w-full border border-line bg-ivory px-3"><option value="">Select bank</option>{["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank"].map((bank) => <option key={bank}>{bank}</option>)}</select></label> : null}
        {method === "cod" ? <p className="text-sm text-muted">Pay in cash when your order arrives. Please keep the exact amount ready if possible.</p> : <label className="mt-5 block max-w-sm text-sm">Mock gateway result<select value={outcome} onChange={(event) => setOutcome(event.target.value as "success" | "failure")} className="mt-1 min-h-11 w-full border border-line bg-ivory px-3"><option value="success">Simulate successful payment</option><option value="failure">Simulate declined payment</option></select></label>}
      </div>
      <p className="flex items-center gap-2 border border-gold/30 bg-pearl p-3 text-xs text-muted"><ShieldCheck aria-hidden className="size-4 text-gold-ink" /> Demo payment only. No real payment is collected; card details are never stored.</p>
    </section>
  );
}

export function CheckoutReviewStep({ address, method, payment, items }: {
  address: CheckoutAddress;
  method: string;
  payment: CheckoutPaymentMethod;
  items: CartItem[];
}) {
  return (
    <section>
      <p className="eyebrow mb-2">Step 4</p>
      <h2 className="display-md mb-5 text-indigo">Review your order</h2>
      <div className="space-y-4 border border-line p-4 text-sm">
        <div><h3 className="font-medium text-ink">Deliver to</h3><p className="mt-1 text-muted">{address.name}<br />{address.line1}{address.line2 ? `, ${address.line2}` : ""}<br />{address.city}, {address.state} {address.pincode}<br />{address.phone} · {address.email}</p></div>
        <div className="border-t border-line pt-3"><h3 className="font-medium text-ink">Delivery & payment</h3><p className="mt-1 text-muted">{method === "express" ? "Express" : "Standard"} delivery · {payment === "cod" ? "Cash on delivery" : payment === "netbanking" ? "Net banking" : payment.toUpperCase()}</p></div>
        <div className="border-t border-line pt-3"><h3 className="font-medium text-ink">Items ({items.length})</h3><p className="mt-1 text-muted">Your order will be split for fulfilment by each maker.</p></div>
      </div>
    </section>
  );
}

export function CheckoutConflictList({ conflicts }: { conflicts: CheckoutConflict[] }) {
  if (!conflicts.length) return null;
  return (
    <div className="mt-4 border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
      <p className="font-medium">Bag updates applied</p>
      <ul className="mt-2 space-y-1">
        {conflicts.map((conflict) => <li key={`${conflict.variantId}-${conflict.kind}`}>{conflict.kind === "price" ? "A current price was loaded." : conflict.kind === "stock" ? `Quantity adjusted to ${conflict.available}.` : conflict.kind === "out_of_stock" ? "An unavailable item was removed." : "An item is no longer available."}</li>)}
      </ul>
    </div>
  );
}
