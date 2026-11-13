import type { Id, ISODateString, Paise } from "./common";

export interface Coupon {
  id: Id;
  /** Upper-case, e.g. "WELCOME10". */
  code: string;
  description: string;
  type: "percent" | "flat";
  /** Percent (e.g. 10) or paise, depending on type. */
  value: number;
  minOrderValue: Paise;
  /** Cap for percent coupons. */
  maxDiscount?: Paise;
  /** Restricts the coupon to one merchant's items. */
  merchantId?: Id;
  startsAt: ISODateString;
  expiresAt: ISODateString;
  usageLimit?: number;
  usedCount: number;
  active: boolean;
}

export interface Story {
  id: Id;
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  /** Paragraphs. */
  body: string[];
  author: string;
  tag: string;
  productIds: Id[];
  publishedAt: ISODateString;
}

export type BannerPlacement = "hero" | "strip" | "promo";

export interface Banner {
  id: Id;
  placement: BannerPlacement;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  cta?: { label: string; href: string };
  image: string;
  mobileImage?: string;
  active: boolean;
  sortOrder: number;
}
