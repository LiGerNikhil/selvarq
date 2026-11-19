import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { AdminPageHeader, AdminSection, StatCard } from "@/components/admin/admin-ui";
import { DataTable, type DataColumn } from "@/components/admin/data-table";
import { getAdminMerchants, getAdminProducts, getAdminReviewStatus, getAdminSettings } from "@/lib/admin-store";
import { listDemoAccounts } from "@/lib/demo-account-store";
import { ordersRepository } from "@/lib/repo";
import { formatDate, formatINR, formatNumber } from "@/lib/format";
import type { Order } from "@/data";

export const metadata: Metadata = { title: "Admin dashboard" };

export default async function AdminDashboardPage() {
  const orders = (await ordersRepository.list({ pageSize: 500 })).items;
  const merchants = getAdminMerchants();
  const products = getAdminProducts();
  const settings = getAdminSettings();
  const accounts = listDemoAccounts();

  const paidOrders = orders.filter((order) => order.paymentStatus === "paid");
  const gmv = paidOrders.reduce((sum, order) => sum + order.total, 0);
  const commission = paidOrders.reduce((sum, order) => {
    return sum + (order.merchantOrders ?? []).reduce((lineSum, group) => {
      const rate = merchants.find((merchant) => merchant.id === group.merchantId)?.commissionRate ?? settings.defaultCommissionRate;
      return lineSum + Math.round(group.subtotal * rate / 100);
    }, 0);
  }, 0);
  const pendingMerchants = merchants.filter((merchant) => merchant.status === "pending");
  const draftProducts = products.filter((product) => product.status === "draft");
  const flaggedReviews = (await import("@/data")).reviews.filter((review) => getAdminReviewStatus(review.id) === "flagged");
  const recentOrders = [...orders].sort((a, b) => b.placedAt.localeCompare(a.placedAt)).slice(0, 6);

  const orderColumns: DataColumn<Order>[] = [
    {
      key: "order",
      header: "Order",
      cell: (order) => <Link href={`/admin/orders?q=${encodeURIComponent(order.orderNumber)}`} className="font-medium text-indigo underline-offset-4 hover:underline">{order.orderNumber}</Link>,
    },
    { key: "customer", header: "Customer", cell: (order) => order.address?.name ?? "Guest" },
    { key: "placed", header: "Placed", cell: (order) => formatDate(order.placedAt), className: "whitespace-nowrap" },
    { key: "status", header: "Status", cell: (order) => <Badge variant={order.status === "cancelled" ? "danger" : order.status === "delivered" ? "success" : "outline"}>{order.status.replaceAll("_", " ")}</Badge> },
    { key: "total", header: "Total", cell: (order) => formatINR(order.total), className: "text-right whitespace-nowrap" },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Today"
        title="Marketplace at a glance"
        description="Live figures from the demo dataset. Changes made anywhere in the admin studio persist for this server process only."
        actions={<ButtonLink href="/admin/merchants">Review merchants</ButtonLink>}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Paid GMV" value={formatINR(gmv)} hint={`${formatNumber(paidOrders.length)} paid orders`} />
        <StatCard label="Commission earned" value={formatINR(commission)} hint={`Default rate ${settings.defaultCommissionRate}%`} tone="positive" />
        <StatCard label="Pending merchants" value={formatNumber(pendingMerchants.length)} hint="Awaiting document review" href="/admin/merchants?status=pending" tone={pendingMerchants.length ? "attention" : "default"} />
        <StatCard label="Moderation queue" value={formatNumber(draftProducts.length)} hint="Draft products awaiting review" href="/admin/moderation" tone={draftProducts.length ? "attention" : "default"} />
        <StatCard label="Customers" value={formatNumber(accounts.filter((account) => account.role === "customer").length)} hint="Registered demo accounts" href="/admin/users" />
        <StatCard label="Active merchants" value={formatNumber(merchants.filter((merchant) => merchant.status === "approved").length)} hint={`${merchants.length} total sellers`} href="/admin/merchants" />
        <StatCard label="Flagged reviews" value={formatNumber(flaggedReviews.length)} hint="Hidden or awaiting a decision" href="/admin/reviews" tone={flaggedReviews.length ? "attention" : "default"} />
        <StatCard label="Total orders" value={formatNumber(orders.length)} hint="All statuses, all time" href="/admin/orders" />
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,1fr)]">
        <AdminSection title="Recent orders" description="Newest first" actions={<ButtonLink href="/admin/orders" variant="ghost" size="sm">All orders</ButtonLink>}>
          <DataTable columns={orderColumns} rows={recentOrders} getRowKey={(order) => order.id} caption="Recent orders" />
        </AdminSection>

        <div className="space-y-6">
          <AdminSection title="Merchant approvals" description="Oldest applications first" actions={<ButtonLink href="/admin/merchants" variant="ghost" size="sm">View all</ButtonLink>}>
            {pendingMerchants.length ? (
              <ul className="divide-y divide-line">
                {pendingMerchants.slice(0, 5).map((merchant) => (
                  <li key={merchant.id} className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-indigo">{merchant.name}</p>
                      <p className="caption mt-1 truncate">{merchant.businessName} · {merchant.city}</p>
                    </div>
                    <ButtonLink href={`/admin/merchants/${merchant.id}`} size="sm" variant="ghost">Review</ButtonLink>
                  </li>
                ))}
              </ul>
            ) : <p className="p-4 text-sm text-muted">No applications waiting. Good.</p>}
          </AdminSection>

          <AdminSection title="Needs attention" description="Shortcuts for the day">
            <ul className="divide-y divide-line text-sm">
              <li className="flex items-center justify-between gap-3 p-4"><span>Draft products to moderate</span><Badge variant={draftProducts.length ? "gold" : "neutral"}>{draftProducts.length}</Badge></li>
              <li className="flex items-center justify-between gap-3 p-4"><span>Reviews flagged</span><Badge variant={flaggedReviews.length ? "danger" : "neutral"}>{flaggedReviews.length}</Badge></li>
              <li className="flex items-center justify-between gap-3 p-4"><span>Free delivery threshold</span><span className="text-muted">{formatINR(settings.freeDeliveryThreshold)}</span></li>
              <li className="flex items-center justify-between gap-3 p-4"><span>GST slabs</span><span className="text-muted">{settings.gstSlabs.map((slab) => `${slab.rate}%`).join(" / ")}</span></li>
            </ul>
          </AdminSection>
        </div>
      </div>
    </>
  );
}