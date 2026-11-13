import { RenderCategoryListing } from "@/app/listings";
import type { ListingSearchParams } from "@/lib/listing";
import { listingCategoryFromSlug } from "@/lib/listing";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = listingCategoryFromSlug(slug);
  return { title: category ? `${category.name} clothing` : "Category not found" };
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<ListingSearchParams> }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  return RenderCategoryListing(slug, query);
}
