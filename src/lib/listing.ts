import { getAdminCategories } from "@/lib/admin-store";
import type { ProductQuery, ProductSort } from "@/lib/repo/products";

export type ListingSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function list(value: string | string[] | undefined): string[] {
  return (Array.isArray(value) ? value : value ? [value] : [])
    .flatMap((item) => item.split(","))
    .map((item) => item.trim())
    .filter(Boolean);
}

function numberParam(value: string | string[] | undefined): number | undefined {
  const parsed = Number(first(value));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

const validSorts = new Set<ProductSort>(["relevance", "new", "price-asc", "price-desc", "rating", "discount"]);

export function parseListingQuery(params: ListingSearchParams, fixed: Partial<ProductQuery> = {}): ProductQuery {
  const categorySlug = first(params.category);
  const category = categorySlug
    ? getAdminCategories().find((item) => item.slug === categorySlug || item.id === categorySlug)
    : undefined;
  const rawSort = first(params.sort) as ProductSort | undefined;
  const min = numberParam(params.min);
  const max = numberParam(params.max);
  const rating = numberParam(params.rating);
  const discount = numberParam(params.discount);
  const pageSize = numberParam(params.pageSize);
  return {
    search: first(params.q)?.trim() || undefined,
    categoryId: category?.id ?? fixed.categoryId,
    collectionId: fixed.collectionId,
    merchantId: fixed.merchantId ?? first(params.merchant),
    minPrice: min === undefined ? undefined : Math.round(min * 100),
    maxPrice: max === undefined ? undefined : Math.round(max * 100),
    colors: list(params.color),
    sizes: list(params.size),
    fabrics: list(params.fabric),
    fits: list(params.fit),
    occasions: list(params.occasion),
    rating: rating !== undefined && rating >= 1 && rating <= 5 ? rating : undefined,
    discount: discount !== undefined && discount >= 0 && discount <= 100 ? discount : undefined,
    inStock: first(params.stock) === "1",
    sort: rawSort && validSorts.has(rawSort) ? rawSort : first(params.q) ? "relevance" : "new",
    page: 1,
    pageSize: Math.min(60, Math.max(12, Math.floor(pageSize ?? 12))),
  };
}

export function listingCategoryTitle(categoryId: string): string {
  return getAdminCategories().find((category) => category.id === categoryId)?.name ?? "Clothing";
}

export function listingCategoryFromSlug(slug: string) {
  return getAdminCategories().find((category) => category.slug === slug);
}
