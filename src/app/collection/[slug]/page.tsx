import type { Metadata } from "next";
import { RenderCollectionListing } from "@/app/listings";
import type { ListingSearchParams } from "@/lib/listing";
import { collectionsRepository } from "@/lib/repo";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const collection = await collectionsRepository.getBySlug(slug);
  if (!collection) return pageMetadata({ title: "Collection not found", description: "This collection is not available.", path: "/shop", noIndex: true });
  return pageMetadata({
    title: collection.name,
    description: collection.description,
    path: `/collection/${collection.slug}`,
  });
}

export default async function CollectionPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<ListingSearchParams> }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  return RenderCollectionListing(slug, query);
}
