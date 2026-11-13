import { categories } from "./categories";
import { collections as collectionSeeds } from "./collections";
import { merchants } from "./merchants";
import { createProducts } from "./products";
import { createReviews } from "./reviews";
import { users } from "./users";
import { banners, coupons, faqs, stories } from "./marketing";
import { createOrders } from "./orders";
import { brandStoryChapters } from "./stories";
import { craftSteps, homepageNewsletter, homepagePress, homepagePromises, homepageTestimonials, instagramTiles } from "./homepage";

export type * from "./types";
export { categories, merchants, users, coupons, stories, banners, faqs };

export const products = createProducts(merchants, collectionSeeds);
export const collections = collectionSeeds.map((collection) => ({
  ...collection,
  productIds: products.filter((product) => product.collectionIds.includes(collection.id)).map((product) => product.id),
}));
export const reviews = createReviews(products, users);
export const orders = createOrders(products, users);
export { brandStoryChapters, craftSteps, homepageNewsletter, homepagePress, homepagePromises, homepageTestimonials, instagramTiles };
