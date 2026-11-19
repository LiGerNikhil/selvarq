import type { Metadata } from "next";
import { RenderSearchListing } from "@/app/listings";
import type { ListingSearchParams } from "@/lib/listing";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Search clothing",
  description: "Find pieces across the SELVARQ catalogue by fabric, fit, maker, size and occasion.",
  path: "/search",
  noIndex: true,
});

export default async function SearchPage({ searchParams }: { searchParams: Promise<ListingSearchParams> }) {
  return RenderSearchListing(await searchParams);
}
