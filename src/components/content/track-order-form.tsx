"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Check, PackageCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";

interface TrackResult {
  orderNumber: string;
  placedAt: string;
  status: string;
  trackingNumber?: string;
  items: { name: string; quantity: number }[];
  shipments: { merchantName: string; status: string; trackingNumber?: string }[];
}

export function TrackOrderForm() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, email }),
      });
      const data = await response.json() as TrackResult & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "We could not find that order.");
      setResult(data);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "We could not find that order.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <form onSubmit={submit} noValidate className="grid max-w-xl gap-4">
        <Input name="orderNumber" label="Order number" hint="For example SVQ-25-10021" value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} required autoComplete="off" />
        <Input name="email" label="Email used at checkout" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
        <div><Button type="submit" loading={busy}>Track order</Button></div>
      </form>

      {error ? <p role="alert" className="mt-5 border border-danger/30 bg-danger/5 p-4 text-sm text-danger">{error}</p> : null}

      {result ? (
        <section aria-live="polite" className="mt-6 max-w-2xl border border-line bg-ivory p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <p className="eyebrow">Order {result.orderNumber}</p>
              <p className="caption mt-1">Placed {formatDate(result.placedAt)}</p>
            </div>
            <Badge variant="success">{result.status.replaceAll("_", " ")}</Badge>
          </div>
          <ol className="mt-5 space-y-4">
            <li className="flex gap-3"><span className="grid size-8 shrink-0 place-items-center bg-pearl text-indigo"><Check aria-hidden className="size-4" /></span><div><p className="text-sm font-medium">Order confirmed</p><p className="caption">We have received your order.</p></div></li>
            <li className="flex gap-3"><span className="grid size-8 shrink-0 place-items-center bg-pearl text-indigo"><PackageCheck aria-hidden className="size-4" /></span><div><p className="text-sm font-medium">Preparation</p><p className="caption">{result.items.map((item) => `${item.quantity} × ${item.name}`).join(", ")}</p></div></li>
            <li className="flex gap-3"><span className="grid size-8 shrink-0 place-items-center bg-pearl text-indigo"><Truck aria-hidden className="size-4" /></span><div><p className="text-sm font-medium">Delivery</p><p className="caption">{result.shipments.length ? result.shipments.map((shipment) => `${shipment.merchantName}: ${shipment.status}${shipment.trackingNumber ? ` (${shipment.trackingNumber})` : ""}`).join(" · ") : "We will share tracking when your parcel ships."}</p></div></li>
          </ol>
          <p className="caption mt-5">Signed in? <Link href="/account/orders" className="text-indigo underline-offset-4 hover:underline">See full order details</Link>.</p>
        </section>
      ) : null}
    </div>
  );
}
