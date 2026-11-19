import type { Metadata } from "next";
import {
  brandStoryChapters,
} from "@/data";
import type { AdminCollection } from "@/lib/admin-store";
import { getAdminBanners, getAdminCategories, getAdminCollections, getAdminMerchants, getAdminStories } from "@/lib/admin-store";
import { getPublicDemoProducts } from "@/lib/demo-merchant-store";
import { BrandStory } from "@/components/home/brand-story";
import { CategoryTiles } from "@/components/home/category-tiles";
import { CollectionCarousel } from "@/components/home/collection-carousel";
import { CommunityGrid, JournalTeaser } from "@/components/home/journal-and-community";
import { CraftProcess } from "@/components/home/craft-process";
import { EditorialHero } from "@/components/home/editorial-hero";
import { HomeNewsletter } from "@/components/home/home-newsletter";
import { HomeProductTabs } from "@/components/home/home-product-tabs";
import { MakersSpotlight } from "@/components/home/makers-spotlight";
import { Testimonials } from "@/components/home/testimonials";
import { TrustStrip } from "@/components/home/trust-strip";
import { SectionHeading } from "@/components/home/category-tiles";
import { BRAND } from "@/lib/config";
import { pageMetadata, SITE_URL } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { getSession } from "@/lib/auth/demo-session";
import { getDemoAccountById } from "@/lib/demo-account-store";
import { ForYouRail } from "@/components/home/for-you-rail";

const siteUrl = SITE_URL;

export const metadata: Metadata = pageMetadata({
  title: "Considered Indian Clothing",
  description: "Explore thoughtfully made Indian clothing from SELVARQ and independent makers. Discover handloom textures, considered details and pieces made to last.",
  path: "/",
});

function structuredData(collections: AdminCollection[]) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: BRAND.name,
      legalName: BRAND.legalEntity,
      url: siteUrl,
      description: "A considered Indian clothing marketplace from Sharda Garments.",
      sameAs: ["https://www.instagram.com/"],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: BRAND.name,
      url: siteUrl,
      inLanguage: "en-IN",
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "SELVARQ featured collections",
      itemListElement: collections.map((collection, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: collection.name,
        url: `${siteUrl}/collection/${collection.slug}`,
      })),
    },
  ];
}

export default async function HomePage() {
  const session = await getSession();
  const account = session?.role === "customer" ? getDemoAccountById(session.userId) : undefined;
  const banners = getAdminBanners();
  const categories = getAdminCategories();
  const collections = getAdminCollections();
  const stories = getAdminStories();
  const products = getPublicDemoProducts();
  const activeBanners = banners.filter((banner) => banner.active);
  const rootCategories = categories.filter((category) => category.parentId === null);
  const activeProducts = products.filter((product) => product.status === "active");
  const newArrivals = [...activeProducts].slice(-8).reverse();
  const bestsellers = [...activeProducts]
    .sort((a, b) => b.rating.count - a.rating.count || b.rating.average - a.rating.average)
    .slice(0, 8);
  const makerHighlights = getAdminMerchants().filter((merchant) => merchant.status === "approved" && merchant.id !== "sharda-garments").slice(0, 4);
  const journalStories = stories.slice(0, 3);
  const featuredCollections = collections.filter((collection) => collection.featured);

  return (
    <main>
      <JsonLd data={structuredData(featuredCollections)} />
      <EditorialHero banners={activeBanners} />
      <TrustStrip />
      {rootCategories.length ? <CategoryTiles categories={rootCategories} products={activeProducts} /> : null}
      <BrandStory chapters={brandStoryChapters} />
      {featuredCollections.length ? <CollectionCarousel collections={featuredCollections} /> : null}

      {newArrivals.length || bestsellers.length ? (
        <section className="page-container py-16 md:py-24">
          <SectionHeading eyebrow="Thoughtful pieces, just in" title="The SELVARQ edit" href="/shop" linkText="Shop all" />
          <HomeProductTabs newArrivals={newArrivals} bestsellers={bestsellers} />
        </section>
      ) : null}

        {account?.preferences.onboardingComplete ? <ForYouRail products={activeProducts} categories={categories} preferences={account.preferences} /> : null}
        {makerHighlights.length ? <MakersSpotlight merchants={makerHighlights} /> : null}
      <CraftProcess />
      <Testimonials />
      <JournalTeaser stories={journalStories} />
      <CommunityGrid />
      <HomeNewsletter />
    </main>
  );
}
