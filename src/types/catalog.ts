import type { Gender, Id, ISODateString, Paise, RatingSummary } from "./common";

export interface Category {
  id: Id;
  slug: string;
  name: string;
  /** Null for top-level categories. */
  parentId: Id | null;
  description: string;
  /** Public id or URL; resolved by <MediaImage>. */
  image: string;
  sortOrder: number;
}

export interface Collection {
  id: Id;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  productIds: Id[];
  featured: boolean;
}

export interface Variant {
  id: Id;
  sku: string;
  size: string;
  colorName: string;
  /** Hex swatch, e.g. "#1F2A6B". */
  colorHex: string;
  stock: number;
  /** Overrides the product price for this variant, when set. */
  price?: Paise;
  images?: string[];
}

export type ProductStatus = "draft" | "pending_review" | "published" | "archived";

export interface Product {
  id: Id;
  slug: string;
  title: string;
  /** "sharda-garments" for the brand's own catalogue. */
  merchantId: Id;
  categoryId: Id;
  collectionIds: Id[];
  gender: Gender;
  /** One honest paragraph. No filler. */
  description: string;
  /** Always stated, e.g. "100% cotton poplin, 120 GSM". */
  fabric: string;
  /** Always stated, e.g. "Regular fit, true to size". */
  fit: string;
  /** Care instructions, one per entry. */
  care: string[];
  highlights: string[];
  images: string[];
  variants: Variant[];
  /** GST-inclusive selling price. */
  price: Paise;
  /** GST-inclusive maximum retail price. */
  mrp: Paise;
  /** Optional per-product GST percent; otherwise the slab applies. */
  gstRateOverride?: number;
  tags: string[];
  rating: RatingSummary;
  status: ProductStatus;
  createdAt: ISODateString;
}
