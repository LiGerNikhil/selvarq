import { categories, collections, merchants } from "@/data";
import type { Category, Collection, Merchant, Product } from "@/data";
import { getMerchantProfile, getPublicDemoProducts } from "@/lib/demo-merchant-store";
import { paginate, type Page, type PageOptions } from "./types";

export type ProductSort =
  | "relevance"
  | "new"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "discount"
  | "featured"
  | "rating-desc"
  | "name-asc";

export interface ProductQuery extends PageOptions {
  search?: string;
  categoryId?: string;
  collectionId?: string;
  merchantId?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  sizes?: string[];
  fabrics?: string[];
  fits?: string[];
  occasions?: string[];
  rating?: number;
  discount?: number;
  inStock?: boolean;
  sort?: ProductSort;
}

export interface ProductFacets {
  categories: { id: string; name: string; count: number }[];
  collections: { id: string; name: string; count: number }[];
  merchants: { id: string; name: string; count: number }[];
  colors: { name: string; hex: string; count: number }[];
  sizes: { name: string; count: number }[];
  fabrics: { name: string; count: number }[];
  fits: { name: string; count: number }[];
  occasions: { id: string; name: string; count: number }[];
  price: { min: number; max: number };
}

export interface ProductsRepository {
  getById(id: string): Promise<Product | undefined>;
  getBySlug(slug: string): Promise<Product | undefined>;
  search(query: ProductQuery): Promise<Page<Product>>;
  facets(query?: ProductQuery): Promise<ProductFacets>;
}

type OmitFilter =
  | "categoryId" | "collectionId" | "merchantId" | "colors" | "sizes" | "price"
  | "fabrics" | "fits" | "occasions" | "rating" | "discount" | "inStock";

const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
const collectionNames = new Map(collections.map((collection) => [collection.id, collection.name]));
const merchantNames = new Map(merchants.map((merchant) => [merchant.id, merchant.name]));

function allProducts(): Product[] {
  return getPublicDemoProducts();
}

function isMerchantApproved(merchantId: string): boolean {
  return (getMerchantProfile(merchantId)?.status ?? merchants.find((merchant) => merchant.id === merchantId)?.status ?? "pending") === "approved";
}

function relevanceScore(product: Product, search: string): number {
  const terms = search.trim().toLocaleLowerCase("en-IN").split(/\s+/).filter(Boolean);
  const title = product.name.toLocaleLowerCase("en-IN");
  const tags = product.tags.join(" ").toLocaleLowerCase("en-IN");
  const category = categoryNames.get(product.categoryId)?.toLocaleLowerCase("en-IN") ?? "";
  const merchant = (getMerchantProfile(product.merchantId)?.name ?? merchantNames.get(product.merchantId) ?? "").toLocaleLowerCase("en-IN");
  const searchable = `${product.description} ${product.fabric} ${product.fit}`.toLocaleLowerCase("en-IN");
  let score = title === search.toLocaleLowerCase("en-IN") ? 100 : title.includes(search.toLocaleLowerCase("en-IN")) ? 60 : 0;
  for (const term of terms) {
    if (title.includes(term)) score += 12;
    if (tags.includes(term)) score += 8;
    if (category.includes(term)) score += 6;
    if (merchant.includes(term)) score += 5;
    if (searchable.includes(term)) score += 2;
  }
  return score;
}

function belongsToCategory(product: Product, categoryId: string): boolean {
  if (product.categoryId === categoryId) return true;
  const productCategory = categories.find((category) => category.id === product.categoryId);
  return productCategory?.parentId === categoryId;
}

function matches(product: Product, query: ProductQuery, omit?: OmitFilter): boolean {
  if (product.status !== "active" || !isMerchantApproved(product.merchantId)) return false;
  const text = query.search?.trim().toLocaleLowerCase("en-IN");
  if (text && relevanceScore(product, text) === 0) return false;
  if (omit !== "categoryId" && query.categoryId && !belongsToCategory(product, query.categoryId)) return false;
  if (omit !== "collectionId" && query.collectionId && !product.collectionIds.includes(query.collectionId)) return false;
  if (omit !== "merchantId" && query.merchantId && product.merchantId !== query.merchantId) return false;
  if (omit !== "price" && query.minPrice !== undefined && product.price < query.minPrice) return false;
  if (omit !== "price" && query.maxPrice !== undefined && product.price > query.maxPrice) return false;
  if (omit !== "colors" && query.colors?.length && !product.variants.some((variant) => variant.stock > 0 && query.colors?.includes(variant.color))) return false;
  if (omit !== "sizes" && query.sizes?.length && !product.variants.some((variant) => variant.stock > 0 && query.sizes?.includes(variant.size))) return false;
  if (omit !== "fabrics" && query.fabrics?.length && !query.fabrics.includes(product.fabric)) return false;
  if (omit !== "fits" && query.fits?.length && !query.fits.includes(product.fit)) return false;
  if (omit !== "occasions" && query.occasions?.length && !query.occasions.some((occasion) =>
    product.categoryId === occasion || product.categoryId.startsWith(`${occasion}-`) || product.tags.includes(occasion),
  )) return false;
  if (omit !== "rating" && query.rating !== undefined && product.rating.average < query.rating) return false;
  if (omit !== "discount" && query.discount !== undefined && (product.mrp <= product.price || Math.floor((product.mrp - product.price) / product.mrp * 100) < query.discount)) return false;
  if (omit !== "inStock" && query.inStock && !product.variants.some((variant) => variant.stock > 0)) return false;
  return true;
}

function sorted(items: Product[], query: ProductQuery): Product[] {
  const copy = [...items];
  switch (query.sort ?? (query.search ? "relevance" : "featured")) {
    case "relevance":
      return copy.sort((a, b) => relevanceScore(b, query.search ?? "") - relevanceScore(a, query.search ?? "") || b.rating.average - a.rating.average);
    case "new":
      return copy.sort((a, b) => b.id.localeCompare(a.id));
    case "price-asc": return copy.sort((a, b) => a.price - b.price || a.id.localeCompare(b.id));
    case "price-desc": return copy.sort((a, b) => b.price - a.price || a.id.localeCompare(b.id));
    case "rating":
    case "rating-desc": return copy.sort((a, b) => b.rating.average - a.rating.average || b.rating.count - a.rating.count);
    case "discount": return copy.sort((a, b) =>
      (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp || b.rating.count - a.rating.count,
    );
    case "name-asc": return copy.sort((a, b) => a.name.localeCompare(b.name, "en-IN"));
    default: return copy;
  }
}

function makeFacets(query: ProductQuery = {}): ProductFacets {
  const forFacet = (omitted: OmitFilter) => allProducts().filter((product) => matches(product, query, omitted));
  const categoryBase = forFacet("categoryId");
  const collectionBase = forFacet("collectionId");
  const merchantBase = forFacet("merchantId");
  const colorBase = forFacet("colors");
  const sizeBase = forFacet("sizes");
  const fabricBase = forFacet("fabrics");
  const fitBase = forFacet("fits");
  const occasionBase = forFacet("occasions");
  const priceBase = forFacet("price");
  const counts = (items: Product[], key: (product: Product) => string[]) => {
    const map = new Map<string, number>();
    for (const product of items) for (const value of key(product)) map.set(value, (map.get(value) ?? 0) + 1);
    return map;
  };
  const categoryCounts = counts(categoryBase, (product) => [product.categoryId]);
  const collectionCounts = counts(collectionBase, (product) => product.collectionIds);
  const merchantCounts = counts(merchantBase, (product) => [product.merchantId]);
  const colorCounts = counts(colorBase, (product) => [...new Set(product.variants.filter((variant) => variant.stock > 0).map((variant) => variant.color))]);
  const sizeCounts = counts(sizeBase, (product) => [...new Set(product.variants.filter((variant) => variant.stock > 0).map((variant) => variant.size))]);
  const fabricCounts = counts(fabricBase, (product) => [product.fabric]);
  const fitCounts = counts(fitBase, (product) => [product.fit]);
  const occasionCounts = counts(occasionBase, (product) => {
    const category = categories.find((item) => item.id === product.categoryId);
    return category?.parentId === "occasion" ? [product.categoryId] : [];
  });
  const colorLookup = new Map(allProducts().flatMap((product) => product.colors.map((color) => [color.name, color.hex] as const)));
  const sortedFacet = (map: Map<string, number>, labels: Map<string, string>) =>
    [...map].map(([id, count]) => ({ id, name: labels.get(id) ?? id, count })).sort((a, b) => a.name.localeCompare(b.name));
  return {
    categories: sortedFacet(categoryCounts, categoryNames),
    collections: sortedFacet(collectionCounts, collectionNames),
    merchants: sortedFacet(merchantCounts, merchantNames),
    colors: [...colorCounts].map(([name, count]) => ({ name, hex: colorLookup.get(name) ?? "#B8AE9D", count })).sort((a, b) => a.name.localeCompare(b.name)),
    sizes: [...sizeCounts].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name)),
    fabrics: [...fabricCounts].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name)),
    fits: [...fitCounts].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name)),
    occasions: [...occasionCounts].map(([id, count]) => ({ id, name: categoryNames.get(id) ?? id, count })).sort((a, b) => a.name.localeCompare(b.name)),
    price: {
      min: priceBase.length ? Math.min(...priceBase.map((product) => product.price)) : 0,
      max: priceBase.length ? Math.max(...priceBase.map((product) => product.price)) : 0,
    },
  };
}

export const mockProductsRepository: ProductsRepository = {
  async getById(id) {
    return allProducts().find((product) => product.id === id && product.status === "active" && isMerchantApproved(product.merchantId));
  },
  async getBySlug(slug) {
    return allProducts().find((product) => product.slug === slug && product.status === "active" && isMerchantApproved(product.merchantId));
  },
  async search(query) {
    return paginate(sorted(allProducts().filter((product) => matches(product, query)), query), query);
  },
  async facets(query) {
    return makeFacets(query);
  },
};

export type { Category, Collection, Merchant };
