import type { Metadata } from "next";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata("Seller payouts", "/merchant/payouts");

import Link from "next/link";
import { Download, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatINR } from "@/lib/format";
import { COMMERCE } from "@/lib/config";
import { getMerchantIdentity } from "@/lib/merchant-access";
import { listMerchantOrders } from "@/lib/demo-merchant-store";

export default async function MerchantPayoutsPage() {
  const identity = await getMerchantIdentity();
  if (!identity) return null;
  const rows = await listMerchantOrders(identity.merchantId);
  const settledRows = rows.filter((row) => row.status !== "returned");
  const totalSales = settledRows.reduce((sum, item) => sum + item.subtotal, 0);
  const totalCommission = settledRows.reduce((sum, item) => sum + item.commission, 0);
  const totalPayout = settledRows.reduce((sum, item) => sum + item.payout, 0);
  return <div><p className="eyebrow">Statements</p><div className="mt-1 flex flex-wrap items-end justify-between gap-3"><h2 className="display-md text-indigo">Payouts & commission</h2><Link href="/api/merchant/payouts?format=csv" className="inline-flex min-h-11 items-center gap-2 border border-line px-4 text-sm text-indigo hover:bg-pearl"><Download aria-hidden className="size-4" />Export CSV</Link></div>
    <p className="body mt-2">A demo statement of your seller order lines. Commission is calculated at {COMMERCE.defaultCommissionRate}% of the item subtotal.</p>
    <div className="mt-6 grid gap-3 sm:grid-cols-3">{[{ label: "Item sales", value: totalSales }, { label: "Platform commission", value: totalCommission }, { label: "Estimated payout", value: totalPayout }].map((stat) => <article key={stat.label} className="border border-line p-4"><p className="caption">{stat.label}</p><p className="mt-3 text-xl font-medium text-indigo">{formatINR(stat.value)}</p></article>)}</div>
    <section className="mt-6 border border-line"><div className="flex items-center gap-2 border-b border-line p-4"><Wallet aria-hidden className="size-5 text-gold-ink" /><h3 className="text-sm font-medium">Commission statement</h3></div>{rows.length ? <div className="overflow-x-auto"><table className="w-full min-w-[42rem] text-left text-sm"><thead className="bg-pearl text-xs uppercase text-muted"><tr><th className="p-3">Order</th><th className="p-3">Date</th><th className="p-3">Item subtotal</th><th className="p-3">Commission · {COMMERCE.defaultCommissionRate}%</th><th className="p-3">Estimated payout</th><th className="p-3">Fulfilment</th></tr></thead><tbody className="divide-y divide-line">{rows.map((row) => <tr key={row.order.id}><td className="p-3">{row.order.orderNumber}</td><td className="p-3">{formatDate(row.order.placedAt)}</td><td className="p-3">{formatINR(row.subtotal)}</td><td className="p-3">{row.status === "returned" ? "—" : `−${formatINR(row.commission)}`}</td><td className="p-3 font-medium">{row.status === "returned" ? "—" : formatINR(row.payout)}</td><td className="p-3"><Badge variant="outline">{row.status.replaceAll("_", " ")}</Badge></td></tr>)}</tbody></table></div> : <p className="body p-5">Your commission statement will appear when orders arrive.</p>}</section>
    <p className="caption mt-4">Payout totals are estimates in this demo, not payment instructions. Settlement timing, GST/TDS treatment and other adjustments are not simulated.</p>
  </div>;
}
