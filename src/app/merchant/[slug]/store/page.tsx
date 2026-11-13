import { RenderMerchantListing } from "@/app/listings";
import type { ListingSearchParams } from "@/lib/listing";
import { merchantsRepository } from "@/lib/repo";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const merchant = await merchantsRepository.getBySlug(slug);
  return { title: merchant ? `${merchant.name} storefront` : "Storefront not found" };
}

export default async function MerchantStorePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<ListingSearchParams> }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  return RenderMerchantListing(slug, query);
}
