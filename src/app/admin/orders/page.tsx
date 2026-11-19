import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AdminPageHeader, AdminSection, StatCard } from "@/components/admin/admin-ui";
import { DataTable, type DataColumn } from "@/components/admin/data-table";
import { ordersRepository } from "@/lib/repo";
import { formatDate, formatINR, formatNumber } from "@/lib/format";
import type { Order } from "@/data";

export const metadata: Metadata = { title: "Admin orders" };

const orderStatuses = ["placed", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"] as const;
const paymentStatuses = ["pending", "paid", "failed", "refunded"] as const;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; payment?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim().toLowerCase();
  const status = orderStatuses.includes((params.status ?? "") as (typeof orderStatuses)[number]) ? params.status! : "all";
  const payment = paymentStatuses.includes((params.payment ?? "") as (typeof paymentStatuses)[number]) ? params.payment! : "all";
  const orders = (await ordersRepository.list({ pageSize: 500 })).items;

  const rows = orders
    .filter((order) => status === "all" || order.status === status)
    .filter((order) => payment === "all" || order.paymentStatus === payment)
    .filter((order) => !q || `${order.orderNumber} ${order.address?.name ?? ""} ${order.address?.email ?? ""} ${order.id}`.toLowerCase().includes(q))
    .sort((a, b) => b.placedAt.localeCompare(a.placedAt));

  const paid = orders.filter((order) => order.paymentStatus === "paid");
  const gmv = paid.reduce((sum, order) => sum + order.total, 0);
  const refunded = orders.filter((order) => order.paymentStatus === "refunded").length;

  const columns: DataColumn<Order>[] = [
    {
      key: "order",
      header: "Order",
      cell: (order) => (
        <div>
          <p className="font-medium text-indigo">{order.orderNumber}</p>
          <p className="caption mt-0.5">{order.id}</p>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      cell: (order) => (
        <div>
          <p>{order.address?.name ?? "Guest"}</p>
          <p className="caption mt-0.5">{order.address?.city ?? "—"} · {order.address?.pincode ?? ""}</p>
        </div>
      ),
    },
    { key: "placed", header: "Placed", cell: (order) => formatDate(order.placedAt), className: "whitespace-nowrap" },
    { key: "items", header: "Items", cell: (order) => formatNumber(order.items.reduce((sum, item) => sum + item.quantity, 0)), className: "whitespace-nowrap" },
    { key: "sellers", header: "Sellers", cell: (order) => formatNumber(order.merchantOrders?.length ?? 0), className: "whitespace-nowrap" },
    { key: "payment", header: "Payment", cell: (order) => <Badge variant={order.paymentStatus === "paid" ? "success" : order.paymentStatus === "failed" ? "danger" : "outline"}>{order.paymentStatus}</Badge> },
    { key: "status", header: "Status", cell: (order) => <Badge variant={order.status === "delivered" ? "success" : order.status === "cancelled" || order.status === "returned" ? "danger" : "outline"}>{order.status}</Badge> },
    { key: "total", header: "Total", cell: (order) => formatINR(order.total), className: "text-right whitespace-nowrap" },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Commerce"
        title="Orders"
        description="Every demo order, newest first. Filters combine so you can inspect a payment or fulfilment state quickly."
        actions={<Link href="/admin/payouts" className="text-sm text-indigo underline-offset-4 hover:underline">View payouts</Link>}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Orders" value={formatNumber(orders.length)} />
        <StatCard label="Paid GMV" value={formatINR(gmv)} tone="positive" />
        <StatCard label="Awaiting payment" value={formatNumber(orders.filter((order) => order.paymentStatus === "pending").length)} tone={orders.some((order) => order.paymentStatus === "pending") ? "attention" : "default"} />
        <StatCard label="Refunded" value={formatNumber(refunded)} />
      </div>

      <form method="get" className="mb-4 grid gap-3 border border-line bg-ivory p-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_10rem_10rem_auto]">
        <Input name="q" label="Search" placeholder="Order number, customer or id" defaultValue={params.q ?? ""} />
        <Select name="status" label="Order status" defaultValue={status}>
          <option value="all">All statuses</option>
          {orderStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
        </Select>
        <Select name="payment" label="Payment" defaultValue={payment}>
          <option value="all">All payments</option>
          {paymentStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
        </Select>
        <div className="flex items-end gap-2">
          <Button type="submit">Filter</Button>
          <Link href="/admin/orders" className="pb-3 text-xs text-muted underline-offset-4 hover:underline">Clear</Link>
        </div>
      </form>

      <AdminSection title="Order ledger" description={`${rows.length} of ${orders.length} orders`}>
        <DataTable columns={columns} rows={rows} getRowKey={(order) => order.id} caption="Orders" empty="No orders match these filters." />
      </AdminSection>
    </>
  );
}