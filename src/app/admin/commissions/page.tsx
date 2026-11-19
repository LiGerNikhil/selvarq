import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader, AdminSection, StatCard } from "@/components/admin/admin-ui";
import { DataTable, type DataColumn } from "@/components/admin/data-table";
import { MerchantCommissionForm } from "@/components/admin/merchant-actions";
import { getAdminMerchants, getAdminSettings, type AdminMerchant } from "@/lib/admin-store";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = { title: "Commission settings" };

export default async function AdminCommissionsPage() {
  const merchants = getAdminMerchants();
  const settings = getAdminSettings();
  const average = merchants.length ? merchants.reduce((sum, merchant) => sum + merchant.commissionRate, 0) / merchants.length : settings.defaultCommissionRate;

  const columns: DataColumn<AdminMerchant>[] = [
    {
      key: "merchant",
      header: "Merchant",
      cell: (merchant) => <Link href={`/admin/merchants/${merchant.id}`} className="font-medium text-indigo underline-offset-4 hover:underline">{merchant.name}</Link>,
    },
    { key: "status", header: "Status", cell: (merchant) => <Badge variant={merchant.status === "approved" ? "success" : "outline"}>{merchant.status}</Badge> },
    { key: "rate", header: "Commission", cell: (merchant) => `${merchant.commissionRate}%`, className: "whitespace-nowrap" },
    { key: "difference", header: "Vs default", cell: (merchant) => `${merchant.commissionRate - settings.defaultCommissionRate > 0 ? "+" : ""}${(merchant.commissionRate - settings.defaultCommissionRate).toFixed(1)} pts`, className: "whitespace-nowrap" },
    { key: "edit", header: "Adjust", cell: (merchant) => <MerchantCommissionForm merchantId={merchant.id} rate={merchant.commissionRate} /> },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Marketplace"
        title="Commissions"
        description="The global rate applies to new merchants. Per-merchant overrides drive payout statements in the seller workspace."
        actions={<Link href="/admin/settings" className="text-sm text-indigo underline-offset-4 hover:underline">Edit global rate</Link>}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Global default" value={`${settings.defaultCommissionRate}%`} hint="Used for new sellers" />
        <StatCard label="Average seller rate" value={`${average.toFixed(1)}%`} hint={`${merchants.length} merchants`} />
        <StatCard label="Overrides" value={String(merchants.filter((merchant) => merchant.commissionRate !== settings.defaultCommissionRate).length)} hint="Different from default" />
      </div>

      <AdminSection title="Per-merchant rates" description="Edits apply to commission and payout calculations immediately">
        <DataTable columns={columns} rows={merchants} getRowKey={(merchant) => merchant.id} caption="Commission rates" />
      </AdminSection>

      <p className="caption mt-4">Commission is calculated on each seller&apos;s item subtotal, excluding delivery. Example: {formatINR(100_000)} at {settings.defaultCommissionRate}% yields {formatINR(12_000)} commission and {formatINR(88_000)} payout.</p>
    </>
  );
}