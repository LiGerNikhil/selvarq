import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader, StatCard } from "@/components/admin/admin-ui";
import { DataTable, type DataColumn } from "@/components/admin/data-table";
import { getAdminMerchants, type AdminMerchant } from "@/lib/admin-store";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Admin merchants" };

const statuses = ["all", "pending", "approved", "suspended", "rejected"] as const;

export default async function AdminMerchantsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams;
  const filter = statuses.includes((params.status ?? "all") as (typeof statuses)[number]) ? params.status ?? "all" : "all";
  const all = getAdminMerchants();
  const merchants = filter === "all" ? all : all.filter((merchant) => merchant.status === filter);

  const columns: DataColumn<AdminMerchant>[] = [
    {
      key: "merchant",
      header: "Merchant",
      cell: (merchant) => (
        <Link href={`/admin/merchants/${merchant.id}`} className="font-medium text-indigo underline-offset-4 hover:underline">
          {merchant.name}
        </Link>
      ),
    },
    { key: "business", header: "Business", cell: (merchant) => <span className="text-muted">{merchant.businessName}</span> },
    { key: "city", header: "City", cell: (merchant) => merchant.city },
    { key: "joined", header: "Joined", cell: (merchant) => formatDate(merchant.joinedAt), className: "whitespace-nowrap" },
    {
      key: "status",
      header: "Status",
      cell: (merchant) => (
        <Badge variant={merchant.status === "pending" ? "gold" : merchant.status === "approved" ? "success" : merchant.status === "suspended" ? "danger" : "outline"}>
          {merchant.status}
        </Badge>
      ),
    },
    { key: "commission", header: "Commission", cell: (merchant) => `${merchant.commissionRate}%`, className: "text-right whitespace-nowrap" },
    {
      key: "documents",
      header: "Documents",
      cell: (merchant) => `${merchant.documents.filter((document) => document.verified).length}/${merchant.documents.length} verified`,
      className: "whitespace-nowrap",
    },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Marketplace"
        title="Merchants"
        description="Review applications and documents, then approve, reject or suspend a seller. Status changes propagate to the seller workspace and public catalogue."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending" value={String(all.filter((merchant) => merchant.status === "pending").length)} hint="Needs a decision" tone={all.some((merchant) => merchant.status === "pending") ? "attention" : "default"} />
        <StatCard label="Approved" value={String(all.filter((merchant) => merchant.status === "approved").length)} />
        <StatCard label="Suspended" value={String(all.filter((merchant) => merchant.status === "suspended").length)} />
        <StatCard label="Rejected" value={String(all.filter((merchant) => merchant.status === "rejected").length)} />
      </div>

      <nav aria-label="Filter merchants by status" className="mb-4 flex flex-wrap gap-2">
        {statuses.map((status) => (
          <Link
            key={status}
            href={status === "all" ? "/admin/merchants" : `/admin/merchants?status=${status}`}
            aria-current={filter === status ? "page" : undefined}
            className={`border px-3 py-2 text-xs uppercase tracking-[0.1em] ${filter === status ? "border-indigo bg-indigo text-ivory" : "border-line text-muted hover:border-indigo"}`}
          >
            {status}
          </Link>
        ))}
      </nav>

      <div className="border border-line bg-ivory">
        <DataTable columns={columns} rows={merchants} getRowKey={(merchant) => merchant.id} caption="Merchants" empty="No merchants match this filter." />
      </div>
    </>
  );
}