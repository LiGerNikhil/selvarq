import { categoriesRepository, collectionsRepository, merchantsRepository, productsRepository } from "@/lib/repo";
import { listingCategoryFromSlug, parseListingQuery, type ListingSearchParams } from "@/lib/listing";
import { ProductListing } from "@/components/listing/product-listing";
import type { ProductQuery } from "@/lib/repo/products";
import { notFound } from "next/navigation";

export async function RenderShopListing(params: ListingSearchParams) {
  const query = parseListingQuery(params);
  const [result, facets, allCategories] = await Promise.all([
    productsRepository.search(query),
    productsRepository.facets(query),
    categoriesRepository.list(),
  ]);
  return <ProductListing title="Shop all clothing" eyebrow="Considered pieces for every day" description="Explore thoughtfully made clothing from SELVARQ and independent Indian makers." products={result.items} total={result.total} facets={facets} query={query} categories={allCategories} />;
}

export async function RenderCategoryListing(slug: string, params: ListingSearchParams) {
  const category = listingCategoryFromSlug(slug);
  if (!category) notFound();
  const query = parseListingQuery(params, { categoryId: category.id });
  const [result, facets, allCategories] = await Promise.all([
    productsRepository.search(query),
    productsRepository.facets(query),
    categoriesRepository.list(),
  ]);
  return <ProductListing title={category.name} eyebrow="Shop by category" description={category.description} products={result.items} total={result.total} facets={facets} query={query} categories={allCategories} />;
}

export async function RenderCollectionListing(slug: string, params: ListingSearchParams) {
  const collection = await collectionsRepository.getBySlug(slug);
  if (!collection) notFound();
  const query = parseListingQuery(params, { collectionId: collection.id });
  const [result, facets, allCategories] = await Promise.all([
    productsRepository.search(query),
    productsRepository.facets(query),
    categoriesRepository.list(),
  ]);
  return <ProductListing title={collection.name} eyebrow="A curated collection" description={collection.description} products={result.items} total={result.total} facets={facets} query={query} categories={allCategories} collection={collection} />;
}

export async function RenderSearchListing(params: ListingSearchParams) {
  const query = parseListingQuery(params);
  const [result, facets, allCategories] = await Promise.all([
    productsRepository.search(query),
    productsRepository.facets(query),
    categoriesRepository.list(),
  ]);
  return <ProductListing title="Search" eyebrow="Find a piece to keep" description="Search across clothing, fabrics, makers and occasions." products={result.items} total={result.total} facets={facets} query={query} categories={allCategories} />;
}

export async function RenderMerchantListing(slug: string, params: ListingSearchParams) {
  const merchant = await merchantsRepository.getBySlug(slug);
  if (!merchant || merchant.status !== "approved") notFound();
  const query: ProductQuery = parseListingQuery(params, { merchantId: merchant.id });
  const [result, facets, allCategories] = await Promise.all([
    productsRepository.search(query),
    productsRepository.facets(query),
    categoriesRepository.list(),
  ]);
  return <ProductListing title={merchant.name} eyebrow={`The maker · ${merchant.city}`} description={merchant.bio} products={result.items} total={result.total} facets={facets} query={query} categories={allCategories} merchant={merchant} />;
}
