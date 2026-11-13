import Link from "next/link";
import { ArrowRight, CircleAlert, PackageCheck, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { formatDate, formatINR } from "@/lib/format";
import { getMerchantIdentity } from "@/lib/merchant-access";
import { getMerchantCatalogProducts, listMerchantOrders } from "@/lib/demo-merchant-store";
import { COMMERCE } from "@/lib/config";

export default async function MerchantDashboardPage() {
  const identity = await getMerchantIdentity();
  if (!identity) return null;
  const merchantOrders = await listMerchantOrders(identity.merchantId);
  const ownProducts = getMerchantCatalogProducts(identity.merchantId);
  const recentOrders = [...merchantOrders].sort((a, b) => b.order.placedAt.localeCompare(a.order.placedAt)).slice(0, 5);
  const acceptedOrders = merchantOrders.filter((item) => !["delivered", "returned"].includes(item.status));
  const settledOrders = merchantOrders.filter((item) => item.status !== "returned");
  const gross = settledOrders.reduce((sum, item) => sum + item.subtotal, 0);
  const commission = settledOrders.reduce((sum, item) => sum + item.commission, 0);
  const lowStock = ownProducts
    .map((product) => ({ product, low: product.variants.filter((variant) => variant.stock <= 8).length }))
    .filter((item) => item.low > 0)
    .sort((a, b) => b.low - a.low);
  const monthBuckets = new Map<string, { sales: number; orders: number }>();
  for (const item of settledOrders) {
    const date = new Date(item.order.placedAt);
    const month = date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    const bucket = monthBuckets.get(month) ?? { sales: 0, orders: 0 };
    monthBuckets.set(month, { sales: bucket.sales + item.subtotal, orders: bucket.orders + 1 });
  }
  const chart = [...monthBuckets].slice(-6);
  const maxAmount = Math.max(...chart.map(([, bucket]) => bucket.sales), 1);
  const maxOrders = Math.max(...chart.map(([, bucket]) => bucket.orders), 1);
  const stats = [
    { label: "Net sales value", value: formatINR(gross), icon: Wallet },
    { label: "Seller orders", value: String(merchantOrders.length), icon: PackageCheck },
    { label: "To fulfil", value: String(acceptedOrders.length), icon: CircleAlert },
    { label: "Estimated payout", value: formatINR(gross - commission), icon: Wallet },
  ];

  return <div className="space-y-7">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">Store overview</p><h2 className="display-md mt-1 text-indigo">Good to see you</h2></div><ButtonLink href="/merchant/products/new" size="sm">Add a product <ArrowRight aria-hidden className="ml-2 size-4" /></ButtonLink></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({ label, value, icon: Icon }) => <article key={label} className="border border-line bg-ivory p-4"><div className="flex items-center justify-between text-muted"><span className="text-xs">{label}</span><Icon aria-hidden className="size-4 text-gold-ink" /></div><p className="mt-3 text-2xl font-medium text-indigo">{value}</p></article>)}</div>
    <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
      <section className="border border-line p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><div><h3 className="text-sm font-medium text-indigo">Sales and orders</h3><p className="caption mt-1">Seller item value and order count · demo data</p></div><Badge variant="outline">{COMMERCE.defaultCommissionRate}% commission</Badge></div>
        {chart.length ? <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <p className="caption">Sales value</p>
            <div className="mt-3 flex h-40 items-end gap-2 border-b border-line px-1">{chart.map(([month, bucket]) => <div key={month} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-[10px] text-muted">{formatINR(bucket.sales)}</span><div className="w-full max-w-10 bg-indigo/80" style={{ height: `${Math.max(8, bucket.sales / maxAmount * 70)}%` }} title={`${month}: ${formatINR(bucket.sales)}`} /><span className="mb-2 text-[10px] text-muted">{month}</span></div>)}</div>
          </div>
          <div>
            <p className="caption">Orders</p>
            <div className="mt-3 flex h-40 items-end gap-2 border-b border-line px-1">{chart.map(([month, bucket]) => <div key={month} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-[10px] text-muted">{bucket.orders}</span><div className="w-full max-w-10 bg-gold/80" style={{ height: `${Math.max(8, bucket.orders / maxOrders * 70)}%` }} title={`${month}: ${bucket.orders} order(s)`} /><span className="mb-2 text-[10px] text-muted">{month}</span></div>)}</div>
          </div>
        </div> : <p className="body mt-5">Your sales and order charts will appear when orders arrive.</p>}
      </section>
      <section className="border border-line p-4 sm:p-5"><div className="flex items-center justify-between"><h3 className="text-sm font-medium text-indigo">Payout snapshot</h3><Wallet aria-hidden className="size-4 text-gold-ink" /></div><p className="display-md mt-5 text-indigo">{formatINR(gross - commission)}</p><p className="caption mt-1">Estimated after commission, excluding returned lines</p><dl className="mt-5 space-y-3 border-t border-line pt-4 text-sm"><div className="flex justify-between"><dt>Item sales</dt><dd>{formatINR(gross)}</dd></div><div className="flex justify-between"><dt>Platform commission</dt><dd>−{formatINR(commission)}</dd></div></dl><Link href="/merchant/payouts" className="mt-5 inline-flex items-center gap-2 text-sm text-indigo underline">View statement <ArrowRight aria-hidden className="size-4" /></Link></section>
    </div>
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="border border-line p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-medium text-indigo">Recent orders</h3><Link href="/merchant/orders" className="text-xs text-indigo underline">All orders</Link></div>{recentOrders.length ? <ul className="mt-4 divide-y divide-line">{recentOrders.map((item) => <li key={item.order.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"><div><p className="font-medium">{item.order.orderNumber}</p><p className="caption mt-1">{formatDate(item.order.placedAt)} · {item.items.length} item(s)</p></div><div className="text-right"><p>{formatINR(item.subtotal)}</p><Badge variant={item.status === "delivered" ? "success" : "gold"} className="mt-1">{item.status.replaceAll("_", " ")}</Badge></div></li>)}</ul> : <p className="body mt-4">No orders yet.</p>}</section>
      <section className="border border-line p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-medium text-indigo">Low stock</h3><Link href="/merchant/products" className="text-xs text-indigo underline">Manage products</Link></div>{lowStock.length ? <ul className="mt-4 divide-y divide-line">{lowStock.slice(0, 5).map(({ product, low }) => <li key={product.id} className="flex items-center justify-between gap-3 py-3 text-sm"><span>{product.name}</span><Badge variant="sale">{low} variant{low === 1 ? "" : "s"} low</Badge></li>)}</ul> : <p className="body mt-4">No low-stock variants to flag.</p>}</section>
    </div>
  </div>;
}
