import type { Metadata } from "next";
import { RenderMerchantListing } from "@/app/listings";
import type { ListingSearchParams } from "@/lib/listing";
import { merchantsRepository } from "@/lib/repo";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const merchant = await merchantsRepository.getBySlug(slug);
  if (!merchant) return pageMetadata({ title: "Storefront not found", description: "This seller is not available.", path: "/shop", noIndex: true });
  return pageMetadata({
    title: `${merchant.name} storefront`,
    description: merchant.bio,
    path: `/merchant/${merchant.slug}/store`,
  });
}

export default async function MerchantStorePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<ListingSearchParams> }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  return RenderMerchantListing(slug, query);
}
