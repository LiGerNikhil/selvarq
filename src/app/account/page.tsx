import type { Metadata } from "next";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata("Account overview", "/account");

import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { ordersRepository, usersRepository } from "@/lib/repo";
import { getSession } from "@/lib/auth/demo-session";
import { formatDate } from "@/lib/format";

export default async function AccountOverviewPage() {
  const session = await getSession();
  if (!session) return null;
  const [accountOrders, account] = await Promise.all([
    ordersRepository.list({ userId: session.userId, page: 1, pageSize: 4 }),
    usersRepository.getById(session.userId),
  ]);
  return <div>
    <p className="eyebrow mb-2">Good to see you</p><h2 className="display-md text-indigo">Hello, {account?.name.split(" ")[0]}</h2>
    <p className="mt-2 text-sm text-muted">Your orders, saved addresses and style notes in one place.</p>
    <div className="mt-7 grid gap-3 sm:grid-cols-3">
      {[["Orders", "/account/orders"], ["Addresses", "/account/addresses"], ["Preferences", "/account/preferences"]].map(([label, href]) => <Link key={href} href={href} className="flex min-h-24 items-center justify-between border border-line p-4 text-sm hover:bg-pearl">{label}<span aria-hidden className="text-gold-ink">→</span></Link>)}
    </div>
    <div className="mt-9 flex items-end justify-between gap-4"><h3 className="display-md text-indigo">Recent orders</h3><Link href="/account/orders" className="min-h-11 inline-flex items-center text-sm text-indigo underline underline-offset-4">All orders</Link></div>
    {accountOrders.items.length ? <ul className="mt-3 divide-y divide-line border-y border-line">{accountOrders.items.map((order) => <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
      <div><p className="text-sm font-medium">{order.orderNumber}</p><p className="caption mt-1">{formatDate(order.placedAt)} · {order.items.length} item{order.items.length === 1 ? "" : "s"}</p></div>
      <div className="flex items-center gap-4"><span className="text-xs capitalize text-muted">{order.status}</span><Link href={`/account/orders/${encodeURIComponent(order.id)}`} className="text-sm text-indigo underline underline-offset-4">View</Link></div>
    </li>)}</ul> : <div className="mt-4 border border-line p-5"><p className="text-sm text-muted">Your orders will appear here after checkout.</p><ButtonLink href="/shop" variant="ghost" className="mt-3">Explore the collection</ButtonLink></div>}
  </div>;
}
