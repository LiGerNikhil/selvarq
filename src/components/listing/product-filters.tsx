"use client";

import type { FormEvent, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import type { ProductFacets, ProductQuery } from "@/lib/repo/products";
import { useListingUrl } from "./use-listing-url";

const filterKeys = ["category", "size", "color", "fabric", "fit", "occasion", "merchant", "rating", "discount", "stock", "min", "max"];

export function ProductFilters({
  facets,
  query,
  mobileOpen,
  onMobileOpenChange,
  total,
}: {
  facets: ProductFacets;
  query: ProductQuery;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  total: number;
}) {
  const update = useListingUrl();
  const applyPrice = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    update({
      min: String(formData.get("min") ?? "").trim() || null,
      max: String(formData.get("max") ?? "").trim() || null,
      pageSize: null,
    });
  };
  const clearAll = () => update(Object.fromEntries(filterKeys.map((key) => [key, null])), true);
  const filterContent = (
    <div className="space-y-6">
      {facets.categories.length ? <FilterSection title="Category">
        {facets.categories.map((item) => <FilterCheck key={item.id} label={item.name} count={item.count} checked={query.categoryId === item.id} onChange={() => update({ category: query.categoryId === item.id ? null : item.id, pageSize: null })} />)}
      </FilterSection> : null}
      {facets.sizes.length ? <FilterSection title="Size">
        {facets.sizes.map((item) => <FilterCheck key={item.name} label={item.name} count={item.count} checked={query.sizes?.includes(item.name) ?? false} onChange={() => toggle("size", item.name, query.sizes ?? [])} />)}
      </FilterSection> : null}
      {facets.colors.length ? <FilterSection title="Colour">
        {facets.colors.map((item) => <FilterCheck key={item.name} label={item.name} count={item.count} checked={query.colors?.includes(item.name) ?? false} swatch={item.hex} onChange={() => toggle("color", item.name, query.colors ?? [])} />)}
      </FilterSection> : null}
      <FilterSection title="Price range">
        <form key={`${query.minPrice ?? ""}-${query.maxPrice ?? ""}`} onSubmit={applyPrice}>
          <div className="flex items-center gap-2">
            <label className="flex min-w-0 flex-1 items-center border border-line px-2">
              <span className="text-xs text-muted">Rs</span>
              <input name="min" aria-label="Minimum price in rupees" type="number" min="0" defaultValue={query.minPrice === undefined ? "" : Math.floor(query.minPrice / 100)} className="min-h-11 w-full min-w-0 bg-transparent px-1 text-sm outline-none" />
            </label>
            <span className="text-muted">–</span>
            <label className="flex min-w-0 flex-1 items-center border border-line px-2">
              <span className="text-xs text-muted">Rs</span>
              <input name="max" aria-label="Maximum price in rupees" type="number" min="0" defaultValue={query.maxPrice === undefined ? "" : Math.floor(query.maxPrice / 100)} className="min-h-11 w-full min-w-0 bg-transparent px-1 text-sm outline-none" />
            </label>
          </div>
          <Button type="submit" size="sm" variant="ghost" fullWidth className="mt-2">Apply range</Button>
        </form>
      </FilterSection>
      {facets.fabrics.length ? <FilterSection title="Fabric">
        {facets.fabrics.map((item) => <FilterCheck key={item.name} label={item.name} count={item.count} checked={query.fabrics?.includes(item.name) ?? false} onChange={() => toggle("fabric", item.name, query.fabrics ?? [])} />)}
      </FilterSection> : null}
      {facets.fits.length ? <FilterSection title="Fit">
        {facets.fits.map((item) => <FilterCheck key={item.name} label={item.name} count={item.count} checked={query.fits?.includes(item.name) ?? false} onChange={() => toggle("fit", item.name, query.fits ?? [])} />)}
      </FilterSection> : null}
      {facets.occasions.length ? <FilterSection title="Occasion">
        {facets.occasions.map((item) => <FilterCheck key={item.id} label={item.name} count={item.count} checked={query.occasions?.includes(item.id) ?? false} onChange={() => toggle("occasion", item.id, query.occasions ?? [])} />)}
      </FilterSection> : null}
      {facets.merchants.length ? <FilterSection title="Merchant">
        {facets.merchants.map((item) => <FilterCheck key={item.id} label={item.name} count={item.count} checked={query.merchantId === item.id} onChange={() => update({ merchant: query.merchantId === item.id ? null : item.id, pageSize: null })} />)}
      </FilterSection> : null}
      <FilterSection title="Rating">
        {[4, 3, 2, 1].map((rating) => <FilterCheck key={rating} label={`${rating}+ stars`} checked={query.rating === rating} onChange={() => update({ rating: query.rating === rating ? null : String(rating), pageSize: null })} />)}
      </FilterSection>
      <FilterSection title="Discount">
        {[40, 30, 20, 10].map((discount) => <FilterCheck key={discount} label={`${discount}% and above`} checked={query.discount === discount} onChange={() => update({ discount: query.discount === discount ? null : String(discount), pageSize: null })} />)}
      </FilterSection>
      <FilterSection title="Availability">
        <FilterCheck label="In stock" checked={query.inStock ?? false} onChange={() => update({ stock: query.inStock ? null : "1", pageSize: null })} />
      </FilterSection>
      <Button variant="quiet" fullWidth onClick={clearAll}>Clear all filters</Button>
    </div>
  );

  function toggle(key: string, value: string, selected: string[]) {
    const next = selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value];
    update({ [key]: next.length ? next.join(",") : null, pageSize: null });
  }

  return (
    <>
      <aside className="hidden w-64 shrink-0 lg:block" aria-label="Product filters">
        <h2 className="eyebrow mb-5">Refine your edit</h2>
        {filterContent}
      </aside>
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange} title="Filter and sort" description={`${total} pieces`} side="bottom" footer={<Button onClick={() => onMobileOpenChange(false)}>Show {total} pieces</Button>}>
        {filterContent}
      </Sheet>
    </>
  );
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-line pb-4">
      <h3 className="mb-2 text-sm font-medium text-indigo">{title}</h3>
      <div className="space-y-0.5">{children}</div>
    </section>
  );
}

function FilterCheck({ label, count, checked, onChange, swatch }: { label: string; count?: number; checked: boolean; onChange: () => void; swatch?: string }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-ink">
      {swatch ? <span aria-hidden className="size-4 shrink-0 rounded-full border border-line" style={{ backgroundColor: swatch }} /> : <input type="checkbox" checked={checked} onChange={onChange} className="size-4 accent-indigo" aria-label={label} />}
      {swatch ? <input type="checkbox" checked={checked} onChange={onChange} className="size-4 accent-indigo" aria-label={label} /> : null}
      <span className="flex-1">{label}</span>
      {count !== undefined ? <span className="text-xs text-muted">{count}</span> : null}
    </label>
  );
}
