import type { Metadata } from "next";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata("Notifications", "/account/notifications");

import { NotificationsForm } from "@/components/account/notifications-form";
import { getSession } from "@/lib/auth/demo-session";
import { getDemoAccountById } from "@/lib/demo-account-store";
import { ordersRepository } from "@/lib/repo";
import { formatDate } from "@/lib/format";

export default async function AccountNotificationsPage() {
  const session = await getSession();
  if (!session) return null;
  const account = getDemoAccountById(session.userId);
  if (!account) return null;
  const recentOrders = await ordersRepository.list({ userId: session.userId, page: 1, pageSize: 5 });
  return <section><p className="eyebrow mb-2">Updates and delivery notes</p><h2 className="display-md mb-6 text-indigo">Notifications</h2>
    <div className="mb-8 border border-line p-4 sm:p-5"><h3 className="mb-4 text-sm font-medium">Recent account activity</h3>{recentOrders.items.length ? <ul className="space-y-3">{recentOrders.items.map((order) => <li key={order.id} className="flex justify-between gap-3 text-sm"><span>Order {order.orderNumber} is <span className="capitalize">{order.status}</span>.</span><time className="caption shrink-0">{formatDate(order.updatedAt)}</time></li>)}</ul> : <p className="caption">Order updates will appear here after checkout.</p>}</div>
    <h3 className="mb-4 text-sm font-medium">Notification preferences</h3><NotificationsForm initial={account.notifications} />
  </section>;
}
