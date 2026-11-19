export type MerchantStatus = "pending" | "approved" | "rejected" | "suspended";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  description: string;
  /** Optional Cloudinary public id or URL for category art. */
  imageId?: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  productIds: string[];
  imageId: string;
}

export interface Merchant {
  id: string;
  name: string;
  slug: string;
  status: MerchantStatus;
  bio: string;
  city: string;
  logoId: string;
  rating: { average: number; count: number };
  joinedAt: string;
}

export interface ProductVariant {
  id: string;
  color: string;
  colorHex: string;
  size: "XS" | "S" | "M" | "L" | "XL" | "XXL";
  stock: number;
  sku: string;
  price?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  story: string;
  merchantId: string;
  categoryId: string;
  collectionIds: string[];
  imageIds: string[];
  colors: { name: string; hex: string }[];
  sizes: ProductVariant["size"][];
  variants: ProductVariant[];
  price: number;
  mrp: number;
  fabric: string;
  fit: string;
  care: string[];
  highlights: string[];
  tags: string[];
  seo: { title: string; description: string };
  rating: { average: number; count: number };
  status: "active" | "draft";
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  authorName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  body: string;
  createdAt: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  imageIds?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "merchant" | "admin";
  merchantId?: string;
  joinedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumSpend: number;
  startsAt: string;
  endsAt: string;
  active: boolean;
  maxDiscount?: number;
  merchantId?: string;
}

export interface Story {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  imageId: string;
  publishedAt: string;
  tags: string[];
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageId: string;
  href: string;
  placement: "hero" | "campaign" | "category";
  active: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: "orders" | "shipping" | "returns" | "payments" | "sellers";
}

export interface OrderItem {
  productId: string;
  name: string;
  imageId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  mrp: number;
  merchantId: string;
  color?: string;
  size?: string;
  sellerName?: string;
  gstRate?: number;
}

export interface MerchantOrder {
  merchantId: string;
  merchantName: string;
  itemIds: string[];
  subtotal: number;
  shipping: number;
  status: "confirmed";
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: "upi" | "card" | "cod" | "netbanking";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentReference?: string;
  paymentMethodLabel?: string;
  couponCode?: string;
  gstIncluded?: number;
  address?: {
    name: string;
    email: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  deliveryMethod?: "standard" | "express";
  merchantOrders?: MerchantOrder[];
  placedAt: string;
  updatedAt: string;
  trackingNumber?: string;
}
