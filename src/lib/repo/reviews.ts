import { reviews } from "@/data";
import type { Review } from "@/data";
import { paginate, type Page, type PageOptions } from "./types";

export interface ReviewQuery extends PageOptions {
  productId?: string;
  userId?: string;
  rating?: Review["rating"];
  verifiedOnly?: boolean;
}

export interface ReviewSummary {
  average: number;
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface ReviewsRepository {
  getById(id: string): Promise<Review | undefined>;
  list(query?: ReviewQuery): Promise<Page<Review>>;
  summary(productId: string): Promise<ReviewSummary>;
}

export const mockReviewsRepository: ReviewsRepository = {
  async getById(id) { return reviews.find((review) => review.id === id); },
  async list(query = {}) {
    const results = reviews.filter((review) =>
      (!query.productId || review.productId === query.productId) &&
      (!query.userId || review.userId === query.userId) &&
      (!query.rating || review.rating === query.rating) &&
      (!query.verifiedOnly || review.verifiedPurchase),
    ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return paginate(results, query);
  },
  async summary(productId) {
    const productReviews = reviews.filter((review) => review.productId === productId);
    const distribution: ReviewSummary["distribution"] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const review of productReviews) distribution[review.rating] += 1;
    const count = productReviews.length;
    return {
      count,
      average: count ? productReviews.reduce((sum, review) => sum + review.rating, 0) / count : 0,
      distribution,
    };
  },
};
