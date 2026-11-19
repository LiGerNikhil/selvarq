import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader, AdminSection, StatCard } from "@/components/admin/admin-ui";
import { DataTable, type DataColumn } from "@/components/admin/data-table";
import { getAdminMerchants, getAdminSettings } from "@/lib/admin-store";
import { ordersRepository } from "@/lib/repo";
import { formatDate, formatINR, formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Admin payouts" };

interface PayoutRow {
  merchantId: string;
  name: string;
  rate: number;
  orders: number;
  subtotal: number;
  commission: number;
  payout: number;
}

interface LineRow {
  id: string;
  orderNumber: string;
  date: string;
  merchant: string;
  items: number;
  subtotal: number;
  rate: number;
  commission: number;
  payout: number;
  status: string;
}

export default async function AdminPayoutsPage() {
  const orders = (await ordersRepository.list({ pageSize: 500 })).items;
  const merchants = getAdminMerchants();
  const settings = getAdminSettings();
  const rateFor = (id: string) => merchants.find((merchant) => merchant.id === id)?.commissionRate ?? settings.defaultCommissionRate;
  const nameFor = (id: string) => merchants.find((merchant) => merchant.id === id)?.name ?? id;
  const eligible = (status: string) => status !== "cancelled" && status !== "returned";

  const summaries = new Map<string, PayoutRow>();
  const lines: LineRow[] = [];

  for (const order of orders) {
    if (order.paymentStatus !== "paid" || !eligible(order.status)) continue;
    for (const group of order.merchantOrders ?? []) {
      if (!eligible(group.status)) continue;
      const rate = rateFor(group.merchantId);
      const commission = Math.round(group.subtotal * rate / 100);
      const row = summaries.get(group.merchantId) ?? {
        merchantId: group.merchantId,
        name: nameFor(group.merchantId),
        rate,
        orders: 0,
        subtotal: 0,
        commission: 0,
        payout: 0,
      };
      row.orders += 1;
      row.subtotal += group.subtotal;
      row.commission += commission;
      row.payout += group.subtotal - commission;
      summaries.set(group.merchantId, row);
      lines.push({
        id: `${order.id}:${group.merchantId}`,
        orderNumber: order.orderNumber,
        date: order.placedAt,
        merchant: row.name,
        items: group.itemIds.length,
        subtotal: group.subtotal,
        rate,
        commission,
        payout: group.subtotal - commission,
        status: group.status,
      });
    }
  }

  const payouts = [...summaries.values()].sort((a, b) => b.payout - a.payout);
  const gross = payouts.reduce((sum, row) => sum + row.subtotal, 0);
  const commission = payouts.reduce((sum, row) => sum + row.commission, 0);
  const net = payouts.reduce((sum, row) => sum + row.payout, 0);
  const recentLines = lines.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30);

  const payoutColumns: DataColumn<PayoutRow>[] = [
    { key: "merchant", header: "Merchant", cell: (row) => <span className="font-medium text-indigo">{row.name}</span> },
    { key: "rate", header: "Rate", cell: (row) => `${row.rate}%`, className: "whitespace-nowrap" },
    { key: "orders", header: "Lines", cell: (row) => formatNumber(row.orders), className: "whitespace-nowrap" },
    { key: "subtotal", header: "Gross", cell: (row) => formatINR(row.subtotal), className: "whitespace-nowrap" },
    { key: "commission", header: "Commission", cell: (row) => formatINR(row.commission), className: "whitespace-nowrap" },
    { key: "payout", header: "Estimated payout", cell: (row) => <span className="font-medium text-indigo">{formatINR(row.payout)}</span>, className: "whitespace-nowrap" },
  ];

  const lineColumns: DataColumn<LineRow>[] = [
    { key: "order", header: "Order", cell: (row) => <span className="font-medium text-indigo">{row.orderNumber}</span> },
    { key: "date", header: "Placed", cell: (row) => formatDate(row.date), className: "whitespace-nowrap" },
    { key: "merchant", header: "Seller", cell: (row) => row.merchant },
    { key: "status", header: "Status", cell: (row) => <Badge variant="outline">{row.status}</Badge> },
    { key: "subtotal", header: "Subtotal", cell: (row) => formatINR(row.subtotal), className: "whitespace-nowrap" },
    { key: "commission", header: "Commission", cell: (row) => `${row.rate}% · ${formatINR(row.commission)}`, className: "whitespace-nowrap" },
    { key: "payout", header: "Payout", cell: (row) => formatINR(row.payout), className: "whitespace-nowrap" },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Commerce"
        title="Payouts"
        description="Estimated seller settlements from paid order lines. Cancelled and returned lines are excluded. These figures are illustrative, not settlement instructions."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Gross seller value" value={formatINR(gross)} />
        <StatCard label="Commission" value={formatINR(commission)} tone="positive" />
        <StatCard label="Estimated payouts" value={formatINR(net)} />
        <StatCard label="Sellers with sales" value={formatNumber(payouts.length)} />
      </div>

      <div className="space-y-6">
        <AdminSection title="By merchant" description="Commission uses each seller's current override">
          <DataTable columns={payoutColumns} rows={payouts} getRowKey={(row) => row.merchantId} caption="Payouts by merchant" />
        </AdminSection>
        <AdminSection title="Recent seller lines" description={`${recentLines.length} of ${lines.length} eligible lines`}>
          <DataTable columns={lineColumns} rows={recentLines} getRowKey={(row) => row.id} caption="Recent payout lines" />
        </AdminSection>
      </div>
    </>
  );
}