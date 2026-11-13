import { RenderShopListing } from "../listings";
import type { ListingSearchParams } from "@/lib/listing";

export const metadata = { title: "Shop clothing" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<ListingSearchParams> }) {
  return RenderShopListing(await searchParams);
}
