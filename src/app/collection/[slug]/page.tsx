import { RenderCollectionListing } from "@/app/listings";
import type { ListingSearchParams } from "@/lib/listing";
import { collectionsRepository } from "@/lib/repo";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const collection = await collectionsRepository.getBySlug(slug);
  return { title: collection?.name ?? "Collection not found" };
}

export default async function CollectionPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<ListingSearchParams> }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  return RenderCollectionListing(slug, query);
}
