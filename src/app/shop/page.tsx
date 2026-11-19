import type { Metadata } from "next";
import { RenderShopListing } from "../listings";
import type { ListingSearchParams } from "@/lib/listing";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Shop clothing",
  description: "Browse considered Indian clothing from SELVARQ and independent makers, with filters for fabric, fit, size and occasion.",
  path: "/shop",
});

export default async function ShopPage({ searchParams }: { searchParams: Promise<ListingSearchParams> }) {
  return RenderShopListing(await searchParams);
}
