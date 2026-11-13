"use client";

import Link from "next/link";
import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { ProductFilters } from "./product-filters";
import { useListingUrl } from "./use-listing-url";
import type { Category, Collection, Merchant, Product } from "@/data";
import type { ProductFacets, ProductQuery, ProductSort } from "@/lib/repo/products";

const sortOptions: [ProductSort, string][] = [
  ["relevance", "Relevance"],
  ["new", "New arrivals"],
  ["price-asc", "Price: low to high"],
  ["price-desc", "Price: high to low"],
  ["rating", "Top rated"],
  ["discount", "Biggest discount"],
];

export function ProductListing({
  title,
  eyebrow,
  description,
  products,
  total,
  facets,
  query,
  categories,
  collection,
  merchant,
}: {
  title: string;
  eyebrow: string;
  description?: string;
  products: Product[];
  total: number;
  facets: ProductFacets;
  query: ProductQuery;
  categories: Category[];
  collection?: Collection;
  merchant?: Merchant;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const update = useListingUrl();
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  const chipItems: { key: string; label: string; value?: string }[] = [
    ...(query.categoryId ? [{ key: "category", label: categoryNames.get(query.categoryId) ?? "Category" }] : []),
    ...(query.sizes ?? []).map((value) => ({ key: "size", value, label: `Size: ${value}` })),
    ...(query.colors ?? []).map((value) => ({ key: "color", value, label: value })),
    ...(query.fabrics ?? []).map((value) => ({ key: "fabric", value, label: value })),
    ...(query.fits ?? []).map((value) => ({ key: "fit", value, label: value })),
    ...(query.occasions ?? []).map((value) => ({ key: "occasion", value, label: categories.find((item) => item.id === value)?.name ?? value })),
    ...(query.merchantId && !merchant ? [{ key: "merchant", label: "Merchant" }] : []),
    ...(query.rating ? [{ key: "rating", label: `${query.rating}+ stars` }] : []),
    ...(query.discount ? [{ key: "discount", label: `${query.discount}%+ off` }] : []),
    ...(query.inStock ? [{ key: "stock", label: "In stock" }] : []),
    ...(query.minPrice !== undefined ? [{ key: "min", label: `From Rs ${Math.floor(query.minPrice / 100).toLocaleString("en-IN")}` }] : []),
    ...(query.maxPrice !== undefined ? [{ key: "max", label: `Up to Rs ${Math.floor(query.maxPrice / 100).toLocaleString("en-IN")}` }] : []),
  ];

  function removeChip(key: string, value?: string) {
    if (value) {
      const current = key === "size" ? query.sizes : key === "color" ? query.colors : key === "fabric" ? query.fabrics : key === "fit" ? query.fits : query.occasions;
      const next = current?.filter((item) => item !== value) ?? [];
      update({ [key]: next.length ? next.join(",") : null, pageSize: null });
      return;
    }
    update({ [key]: null, pageSize: null });
  }

  return (
    <main className="page-container min-h-[50dvh] py-8 md:py-12">
      <nav aria-label="Breadcrumb" className="mb-5 text-xs text-muted">
        <Link href="/" className="hover:text-indigo">Home</Link><span aria-hidden className="px-2">/</span>
        <Link href="/shop" className="hover:text-indigo">Shop</Link>
        {collection ? <><span aria-hidden className="px-2">/</span><span>{collection.name}</span></> : null}
        {merchant ? <><span aria-hidden className="px-2">/</span><span>{merchant.name}</span></> : null}
      </nav>
      <div className="mb-8 flex flex-col gap-3 border-b border-line pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="display-md mt-2 text-indigo">{title}</h1>
          {description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{description}</p> : null}
        </div>
        {merchant ? <p className="max-w-sm text-sm text-muted">{merchant.city} · {merchant.rating.average.toFixed(1)} rated</p> : null}
      </div>
      {query.search ? <p className="mb-5 text-sm text-muted">Search results for <strong className="font-medium text-ink">“{query.search}”</strong></p> : null}

      <div className="flex items-start gap-8">
        <ProductFilters facets={facets} query={query} mobileOpen={filtersOpen} onMobileOpenChange={setFiltersOpen} total={total} />
        <section className="min-w-0 flex-1" aria-label="Product results">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <p className="text-sm text-muted"><strong className="font-medium text-ink">{total}</strong> {total === 1 ? "piece" : "pieces"}</p>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setFiltersOpen(true)} className="inline-flex min-h-11 items-center gap-2 border border-line px-3 text-xs font-medium uppercase tracking-wide text-indigo lg:hidden">
                <Filter aria-hidden className="size-4" /> Filter
              </button>
              <label className="flex min-h-11 items-center gap-2 text-xs text-muted">
                <span className="hidden sm:inline">Sort by</span>
                <select aria-label="Sort products" value={query.sort ?? "new"} onChange={(event) => update({ sort: event.target.value, pageSize: null })} className="min-h-11 max-w-48 bg-ivory text-sm text-indigo outline-none">
                  {sortOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
            </div>
          </div>

          {chipItems.length ? (
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {chipItems.map((chip, index) => (
                <button key={`${chip.key}-${chip.value ?? index}`} type="button" onClick={() => removeChip(chip.key, chip.value)} className="inline-flex min-h-9 items-center gap-1 border border-line bg-white/50 px-2.5 text-xs text-ink hover:border-indigo">
                  {chip.label}<X aria-hidden className="size-3.5 text-muted" />
                </button>
              ))}
              <button type="button" onClick={() => update({ category: null, size: null, color: null, fabric: null, fit: null, occasion: null, merchant: null, rating: null, discount: null, stock: null, min: null, max: null, pageSize: null }, true)} className="min-h-9 px-2 text-xs text-indigo underline underline-offset-2">Clear filters</button>
            </div>
          ) : null}

          {products.length ? (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
              {query.pageSize !== undefined && query.pageSize < total ? (
                <div className="mt-10 text-center">
                  <p className="mb-3 text-xs text-muted">Showing {products.length} of {total} pieces</p>
                  <Button variant="ghost" onClick={() => update({ pageSize: String(Math.min(total, (query.pageSize ?? 12) + 12)) })}>Load more</Button>
                </div>
              ) : null}
            </>
          ) : (
            <div className="flex min-h-80 flex-col items-center justify-center border border-dashed border-line px-6 text-center">
              <p className="eyebrow">Nothing just yet</p>
              <h2 className="display-md mt-2 text-indigo">No pieces found</h2>
              <p className="mt-3 max-w-md text-sm text-muted">Try adjusting your filters or search for a different fabric, category or occasion.</p>
              <Button variant="ghost" className="mt-5" onClick={() => update({ category: null, size: null, color: null, fabric: null, fit: null, occasion: null, merchant: null, rating: null, discount: null, stock: null, min: null, max: null, pageSize: null }, true)}>Clear filters</Button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
