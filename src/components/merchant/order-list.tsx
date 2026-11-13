"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Truck } from "lucide-react";
import type { MerchantOrderLine, MerchantFulfilmentStatus } from "@/lib/demo-merchant-store";
import { products } from "@/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate, formatINR } from "@/lib/format";
import { COMMERCE } from "@/lib/config";

const nextAction: Partial<Record<MerchantFulfilmentStatus, { status: MerchantFulfilmentStatus; label: string }>> = {
  placed: { status: "accepted", label: "Accept order" },
  accepted: { status: "packed", label: "Mark packed" },
  shipped: { status: "delivered", label: "Mark delivered" },
  return_requested: { status: "returned", label: "Confirm return" },
};

export function MerchantOrderList({ orders }: { orders: MerchantOrderLine[] }) {
  const router = useRouter();
  const [delivery, setDelivery] = useState<Record<string, { courier: string; awb: string }>>({});
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  async function update(orderId: string, status: MerchantFulfilmentStatus) {
    setBusy(orderId);
    setMessage("");
    try {
      const details = delivery[orderId] ?? { courier: "", awb: "" };
      const response = await fetch(`/api/merchant/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...(status === "shipped" ? details : {}) }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not update this order.");
      setMessage(`Order updated: ${status.replaceAll("_", " ")}.`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update this order.");
    } finally { setBusy(""); }
  }

  if (!orders.length) return <p className="body mt-6 border border-dashed border-line p-8 text-center">Seller orders will appear here when customers place an order.</p>;
  return <div className="mt-6 space-y-4">
    {message ? <p role="status" className="text-sm text-indigo">{message}</p> : null}
    {orders.map((item) => {
      const action = nextAction[item.status];
      return <article key={item.order.id} className="border border-line bg-ivory p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-medium text-indigo">{item.order.orderNumber}</p><p className="caption mt-1">{formatDate(item.order.placedAt)} · {item.items.length} seller item(s)</p></div><div className="text-right"><Badge variant={item.status === "delivered" || item.status === "returned" ? "success" : item.status === "return_requested" ? "sale" : "gold"}>{item.status.replaceAll("_", " ")}</Badge><p className="mt-2 text-sm font-medium">{formatINR(item.subtotal)}</p></div></div>
        <ul className="mt-4 divide-y divide-line border-y border-line">{item.items.map((product) => {
          const variant = product.color && product.size ? undefined : products.find((entry) => entry.id === product.productId)?.variants.find((entry) => entry.id === product.variantId);
          return <li key={product.variantId} className="flex flex-wrap justify-between gap-3 py-3 text-sm"><span>{product.name} · {product.color ?? variant?.color ?? "Colour"} / {product.size ?? variant?.size ?? "Size"} · Qty {product.quantity}</span><span>{formatINR(product.unitPrice * product.quantity)}</span></li>;
        })}</ul>
        <p className="caption mt-3">Estimated payout after {COMMERCE.defaultCommissionRate}% commission: {formatINR(item.payout)}{item.courier || item.awb ? ` · ${item.courier ?? "Courier"} · AWB ${item.awb ?? "pending"}` : ""}</p>
        {item.status === "packed" ? <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"><Input label="Courier" value={delivery[item.order.id]?.courier ?? item.courier ?? ""} onChange={(event) => setDelivery((current) => ({ ...current, [item.order.id]: { courier: event.target.value, awb: current[item.order.id]?.awb ?? item.awb ?? "" } }))} placeholder="Courier partner" /><Input label="AWB / tracking number" value={delivery[item.order.id]?.awb ?? item.awb ?? ""} onChange={(event) => setDelivery((current) => ({ ...current, [item.order.id]: { courier: current[item.order.id]?.courier ?? item.courier ?? "", awb: event.target.value } }))} placeholder="Enter tracking number" /><Button disabled={busy === item.order.id} onClick={() => update(item.order.id, "shipped")}><Truck aria-hidden className="mr-2 size-4" />Dispatch</Button></div> : null}
        {action ? <div className="mt-4 flex flex-wrap gap-2"><Button size="sm" loading={busy === item.order.id} onClick={() => update(item.order.id, action.status)}>{action.label} <ArrowRight aria-hidden className="ml-2 size-4" /></Button>{item.status === "accepted" || item.status === "shipped" || item.status === "delivered" ? <Button size="sm" variant="ghost" disabled={busy === item.order.id} onClick={() => update(item.order.id, "return_requested")}>Record return request</Button> : null}</div> : item.status === "delivered" ? <Button size="sm" variant="ghost" className="mt-4" disabled={busy === item.order.id} onClick={() => update(item.order.id, "return_requested")}>Record return request</Button> : null}
      </article>;
    })}
  </div>;
}
