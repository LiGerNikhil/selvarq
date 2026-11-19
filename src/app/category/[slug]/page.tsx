import type { Metadata } from "next";
import { RenderCategoryListing } from "@/app/listings";
import type { ListingSearchParams } from "@/lib/listing";
import { listingCategoryFromSlug } from "@/lib/listing";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = listingCategoryFromSlug(slug);
  if (!category) return pageMetadata({ title: "Category not found", description: "This category is not available.", path: "/shop", noIndex: true });
  return pageMetadata({
    title: `${category.name} clothing`,
    description: category.description,
    path: `/category/${category.slug}`,
  });
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<ListingSearchParams> }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  return RenderCategoryListing(slug, query);
}
