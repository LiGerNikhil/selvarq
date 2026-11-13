import { banners, coupons, stories } from "@/data";
import type { Banner, Coupon, Story } from "@/data";
import { paginate, type Page, type PageOptions } from "./types";

export interface CouponsRepository {
  getByCode(code: string): Promise<Coupon | undefined>;
  listActive(now?: Date): Promise<Coupon[]>;
}

export interface StoriesRepository {
  getById(id: string): Promise<Story | undefined>;
  getBySlug(slug: string): Promise<Story | undefined>;
  list(options?: PageOptions): Promise<Page<Story>>;
}

export interface BannersRepository {
  getById(id: string): Promise<Banner | undefined>;
  list(placement?: Banner["placement"]): Promise<Banner[]>;
}

export const mockCouponsRepository: CouponsRepository = {
  async getByCode(code) { return coupons.find((coupon) => coupon.code.toUpperCase() === code.trim().toUpperCase()); },
  async listActive(now = new Date()) {
    const timestamp = now.getTime();
    return coupons.filter((coupon) =>
      coupon.active && Date.parse(coupon.startsAt) <= timestamp && Date.parse(coupon.endsAt) >= timestamp,
    );
  },
};

export const mockStoriesRepository: StoriesRepository = {
  async getById(id) { return stories.find((story) => story.id === id); },
  async getBySlug(slug) { return stories.find((story) => story.slug === slug); },
  async list(options) {
    return paginate([...stories].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)), options);
  },
};

export const mockBannersRepository: BannersRepository = {
  async getById(id) { return banners.find((banner) => banner.id === id); },
  async list(placement) { return banners.filter((banner) => banner.active && (!placement || banner.placement === placement)); },
};
