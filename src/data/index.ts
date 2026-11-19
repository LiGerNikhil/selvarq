import { demoDataEnabled } from "@/lib/demo-data";
import { categories as seedCategories } from "./categories";
import { collections as collectionSeeds } from "./collections";
import { merchants as seedMerchants } from "./merchants";
import { createProducts } from "./products";
import { createReviews } from "./reviews";
import { users as seedUsers } from "./users";
import { banners as seedBanners, coupons as seedCoupons, faqs, stories as seedStories } from "./marketing";
import { createOrders } from "./orders";
import { brandStoryChapters } from "./stories";
import { craftSteps, homepageNewsletter, homepagePress, homepagePromises, homepageTestimonials, instagramTiles } from "./homepage";
import type { Category, Collection, Order, Product, Review, User } from "./types";

export type * from "./types";
export { faqs, brandStoryChapters, craftSteps, homepageNewsletter, homepagePress, homepagePromises, homepageTestimonials, instagramTiles };

/**
 * Demo catalogue switch.
 *
 * With `DATA_SOURCE=mongo` (production) the bundled demo catalogue is not
 * exported at all, so no page or client component can render mock products,
 * categories, merchants, reviews or orders. Editorial copy (FAQs, brand story,
 * homepage sections) is real content and stays.
 *
 * `NEXT_PUBLIC_DATA_SOURCE` mirrors `DATA_SOURCE` so the same decision applies
 * inside client bundles, which cannot read server-only variables.
 */
const demo = demoDataEnabled();

export const categories: Category[] = demo ? seedCategories : [];
export const merchants = demo ? seedMerchants : [];
export const users: User[] = demo ? seedUsers : [];
export const coupons = demo ? seedCoupons : [];
export const stories = demo ? seedStories : [];
export const banners = demo ? seedBanners : [];

export const products: Product[] = demo ? createProducts(seedMerchants, collectionSeeds) : [];
export const collections: Collection[] = demo
  ? collectionSeeds.map((collection) => ({
      ...collection,
      productIds: products.filter((product) => product.collectionIds.includes(collection.id)).map((product) => product.id),
    }))
  : [];
export const reviews: Review[] = demo ? createReviews(products, seedUsers) : [];
export const orders: Order[] = demo ? createOrders(products, seedUsers, seedMerchants) : [];
