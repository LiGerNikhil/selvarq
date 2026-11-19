import { mockCategoriesRepository, mockCollectionsRepository } from "./catalog";
import { mockMerchantsRepository } from "./merchants";
import { mockOrdersRepository } from "./orders";
import { mockProductsRepository } from "./products";
import { mockReviewsRepository } from "./reviews";
import { mockUsersRepository } from "./users";
import { mockBannersRepository, mockCouponsRepository, mockStoriesRepository } from "./marketing";

const dataSource = process.env.DATA_SOURCE ?? "mock";

if (dataSource !== "mock" && dataSource !== "mongo") {
  throw new Error(`DATA_SOURCE="${dataSource}" is not supported. Use "mock" or "mongo".`);
}

/**
 * Repositories always read from the in-memory working set. With
 * DATA_SOURCE=mongo that set is hydrated from MongoDB at boot and every
 * mutation is written back, so callers do not need to change.
 */
export const repositories = {
  products: mockProductsRepository,
  categories: mockCategoriesRepository,
  collections: mockCollectionsRepository,
  merchants: mockMerchantsRepository,
  users: mockUsersRepository,
  orders: mockOrdersRepository,
  reviews: mockReviewsRepository,
  coupons: mockCouponsRepository,
  stories: mockStoriesRepository,
  banners: mockBannersRepository,
} as const;

export const {
  products: productsRepository,
  categories: categoriesRepository,
  collections: collectionsRepository,
  merchants: merchantsRepository,
  users: usersRepository,
  orders: ordersRepository,
  reviews: reviewsRepository,
  coupons: couponsRepository,
  stories: storiesRepository,
  banners: bannersRepository,
} = repositories;

export * from "./types";
export type { ProductQuery, ProductSort, ProductFacets } from "./products";
export type { MerchantQuery } from "./merchants";
export type { OrderQuery } from "./orders";
export type { ReviewQuery, ReviewSummary } from "./reviews";
