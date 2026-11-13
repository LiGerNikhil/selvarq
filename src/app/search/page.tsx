import { RenderSearchListing } from "@/app/listings";
import type { ListingSearchParams } from "@/lib/listing";

export const metadata = { title: "Search clothing" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<ListingSearchParams> }) {
  return RenderSearchListing(await searchParams);
}
