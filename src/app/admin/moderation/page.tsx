import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader, AdminSection, StatCard } from "@/components/admin/admin-ui";
import { ProductModerationTable, type ModerationRow } from "@/components/admin/product-moderation";
import { getAdminCategories, getAdminMerchants, getAdminProducts } from "@/lib/admin-store";

export const metadata: Metadata = { title: "Product moderation" };

const tabs = ["draft", "active"] as const;

export default async function AdminModerationPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams;
  const status = tabs.includes((params.status ?? "draft") as (typeof tabs)[number]) ? params.status ?? "draft" : "draft";
  const products = getAdminProducts();
  const merchants = getAdminMerchants();
  const categories = getAdminCategories();

  const rows: ModerationRow[] = products
    .filter((product) => product.status === status)
    .map((product) => ({
      product,
      merchantName: merchants.find((merchant) => merchant.id === product.merchantId)?.name ?? product.merchantId,
      categoryName: categories.find((category) => category.id === product.categoryId)?.name ?? product.categoryId,
    }))
    .sort((a, b) => a.product.name.localeCompare(b.product.name));

  return (
    <>
      <AdminPageHeader
        eyebrow="Marketplace"
        title="Product moderation"
        description="Approve draft listings to publish them, or return live listings to draft. Choices update the public catalogue immediately."
        actions={<Link href="/admin/products" className="text-sm text-indigo underline-offset-4 hover:underline">Manage all products</Link>}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Drafts" value={String(products.filter((product) => product.status === "draft").length)} hint="Awaiting review" tone={products.some((product) => product.status === "draft") ? "attention" : "default"} />
        <StatCard label="Live" value={String(products.filter((product) => product.status === "active").length)} hint="Visible in the catalogue" tone="positive" />
        <StatCard label="Total listings" value={String(products.length)} hint="Across all merchants" />
      </div>

      <nav aria-label="Filter moderation queue" className="mb-4 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link key={tab} href={`/admin/moderation?status=${tab}`} aria-current={status === tab ? "page" : undefined} className={`border px-3 py-2 text-xs uppercase tracking-[0.1em] ${status === tab ? "border-indigo bg-indigo text-ivory" : "border-line text-muted hover:border-indigo"}`}>
            {tab === "draft" ? "Drafts" : "Live listings"}
          </Link>
        ))}
      </nav>

      <AdminSection title={status === "draft" ? "Draft queue" : "Live listings"} description={status === "draft" ? "Bulk approve or return listings to the seller" : "Unpublish a listing without deleting it"}>
        <ProductModerationTable rows={rows} />
      </AdminSection>
    </>
  );
}