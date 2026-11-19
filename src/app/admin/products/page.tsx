import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AdminPageHeader, AdminSection, StatCard } from "@/components/admin/admin-ui";
import { DataTable, type DataColumn } from "@/components/admin/data-table";
import { DeleteProductButton } from "@/components/admin/product-actions";
import { getAdminCategories, getAdminMerchants, getAdminProducts } from "@/lib/admin-store";
import { formatINR } from "@/lib/format";
import { PLATFORM_SELLER } from "@/lib/config";
import type { Product } from "@/data";

export const metadata: Metadata = { title: "Admin products" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; merchant?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim().toLowerCase();
  const status = params.status === "active" || params.status === "draft" ? params.status : "all";
  const merchantId = params.merchant ?? "all";
  const products = getAdminProducts();
  const merchants = getAdminMerchants();
  const categories = getAdminCategories();

  const rows = products.filter((product) => {
    if (status !== "all" && product.status !== status) return false;
    if (merchantId !== "all" && product.merchantId !== merchantId) return false;
    if (q && !`${product.name} ${product.slug}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const columns: DataColumn<Product>[] = [
    {
      key: "product",
      header: "Product",
      cell: (product) => (
        <div>
          <Link href={`/admin/products/${product.id}/edit`} className="font-medium text-indigo underline-offset-4 hover:underline">{product.name}</Link>
          <p className="caption mt-0.5">{product.slug}</p>
        </div>
      ),
    },
    { key: "merchant", header: "Sold by", cell: (product) => merchants.find((merchant) => merchant.id === product.merchantId)?.name ?? product.merchantId },
    { key: "category", header: "Category", cell: (product) => categories.find((category) => category.id === product.categoryId)?.name ?? product.categoryId },
    { key: "price", header: "Price", cell: (product) => formatINR(product.price), className: "whitespace-nowrap" },
    { key: "stock", header: "Stock", cell: (product) => product.variants.reduce((sum, variant) => sum + variant.stock, 0), className: "whitespace-nowrap" },
    { key: "status", header: "Status", cell: (product) => <Badge variant={product.status === "active" ? "success" : "gold"}>{product.status}</Badge> },
    {
      key: "actions",
      header: "",
      cell: (product) => (
        <div className="flex items-center gap-1">
          <ButtonLink href={`/admin/products/${product.id}/edit`} size="sm" variant="ghost">Edit</ButtonLink>
          <DeleteProductButton id={product.id} name={product.name} />
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Marketplace"
        title="Products"
        description={`Platform-owned listings are sold by ${PLATFORM_SELLER.name}. Use the same editor as sellers, with admin access.`}
        actions={<ButtonLink href="/admin/products/new"><Plus aria-hidden className="mr-1 size-4" />New product</ButtonLink>}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="All listings" value={String(products.length)} />
        <StatCard label="Live" value={String(products.filter((product) => product.status === "active").length)} tone="positive" />
        <StatCard label="Drafts" value={String(products.filter((product) => product.status === "draft").length)} tone={products.some((product) => product.status === "draft") ? "attention" : "default"} />
      </div>

      <form method="get" className="mb-4 grid gap-3 border border-line bg-ivory p-4 sm:grid-cols-[minmax(0,1fr)_10rem_12rem_auto]">
        <Input name="q" label="Search" placeholder="Product name or slug" defaultValue={params.q ?? ""} />
        <Select name="status" label="Status" defaultValue={status}>
          <option value="all">All</option>
          <option value="active">Live</option>
          <option value="draft">Draft</option>
        </Select>
        <Select name="merchant" label="Merchant" defaultValue={merchantId}>
          <option value="all">All merchants</option>
          {merchants.map((merchant) => <option key={merchant.id} value={merchant.id}>{merchant.name}</option>)}
        </Select>
        <div className="flex items-end gap-2">
          <Button type="submit">Filter</Button>
          <Link href="/admin/products" className="pb-3 text-xs text-muted underline-offset-4 hover:underline">Clear</Link>
        </div>
      </form>

      <AdminSection title="Catalogue" description={`${rows.length} of ${products.length} products`}>
        <DataTable columns={columns} rows={rows} getRowKey={(product) => product.id} caption="Products" empty="No products match these filters." />
      </AdminSection>
    </>
  );
}