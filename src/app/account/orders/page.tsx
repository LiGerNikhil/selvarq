import Link from "next/link";
import { MediaImage } from "@/components/ui/media-image";
import { formatDate, formatINR } from "@/lib/format";
import { getSession } from "@/lib/auth/demo-session";
import { ordersRepository } from "@/lib/repo";

export default async function AccountOrdersPage() {
  const session = await getSession();
  if (!session) return null;
  const result = await ordersRepository.list({ userId: session.userId, page: 1, pageSize: 50 });
  return <section><p className="eyebrow mb-2">Your purchases</p><h2 className="display-md mb-6 text-indigo">Orders</h2>
    {result.items.length ? <ul className="space-y-4">{result.items.map((order) => <li key={order.id} className="border border-line p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-medium">{order.orderNumber}</p><p className="caption mt-1">Placed {formatDate(order.placedAt)} · <span className="capitalize">{order.status}</span></p></div><p className="text-sm font-medium">{formatINR(order.total)}</p></div>
      <ul className="mt-4 flex flex-wrap gap-3">{order.items.map((item) => <li key={item.variantId} className="flex min-w-0 items-center gap-2 text-xs"><div className="w-10 shrink-0"><MediaImage src={item.imageId} alt="" ratio="4/5" sizes="40px" /></div><span className="max-w-40 truncate">{item.name}</span></li>)}</ul>
      <Link href={`/account/orders/${encodeURIComponent(order.id)}`} className="mt-4 inline-flex min-h-11 items-center text-sm text-indigo underline underline-offset-4">Order details and tracking</Link>
    </li>)}</ul> : <p className="border border-line p-5 text-sm text-muted">No orders yet. Your next favourite piece may be waiting in the shop.</p>}
  </section>;
}
