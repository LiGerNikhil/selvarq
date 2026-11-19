import { z } from "zod";
import { merchantProductSchema } from "@/lib/merchant-schemas";

const slug = z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase slug with hyphens.");

export const adminMerchantPatchSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "suspended"]).optional(),
  commissionRate: z.number().min(0).max(50).optional(),
  rejectionReason: z.string().trim().max(300).optional(),
  documentId: z.string().min(1).optional(),
  documentVerified: z.boolean().optional(),
});

export const adminSettingsSchema = z.object({
  defaultCommissionRate: z.number().min(0).max(50),
  gstSlabs: z.array(z.object({
    upToPerPiece: z.number().int().positive().nullable(),
    rate: z.number().min(0).max(50),
  })).min(1).max(5),
  freeDeliveryThreshold: z.number().int().min(0),
  standardShippingFee: z.number().int().min(0),
  returnWindowDays: z.number().int().min(0).max(60),
  deliveryDays: z.object({ min: z.number().int().min(0).max(30), max: z.number().int().min(0).max(60) }),
}).refine((value) => value.deliveryDays.max >= value.deliveryDays.min, { path: ["deliveryDays", "max"], message: "Maximum delivery days must be at least the minimum." });

export const adminProductSchema = merchantProductSchema.extend({
  collectionIds: z.array(z.string().min(1)).max(12).optional(),
});

export const adminCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2).max(80),
  slug,
  parentId: z.string().nullable(),
  description: z.string().trim().min(10).max(300),
  imageId: z.string().trim().optional(),
});

export const adminCollectionSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2).max(80),
  slug,
  description: z.string().trim().min(10).max(300),
  imageId: z.string().trim().min(1),
  featured: z.boolean(),
  productIds: z.array(z.string().min(1)).max(200).optional(),
});

export const adminBannerSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(2).max(80),
  subtitle: z.string().trim().min(2).max(160),
  imageId: z.string().trim().min(1),
  href: z.string().trim().min(1).max(200),
  placement: z.enum(["hero", "campaign", "category"]),
  active: z.boolean(),
});

export const adminStorySchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(3).max(100),
  slug,
  excerpt: z.string().trim().min(20).max(220),
  body: z.string().trim().min(40).max(4000),
  imageId: z.string().trim().min(1),
  publishedAt: z.string().min(4),
  tags: z.array(z.string().trim().min(1).max(30)).max(8),
});

export const adminCouponSchema = z.object({
  id: z.string().optional(),
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,24}$/, "Use 3–24 letters, numbers, hyphens or underscores."),
  description: z.string().trim().min(10).max(200),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().int().positive(),
  minimumSpend: z.number().int().min(0),
  startsAt: z.string().min(4),
  endsAt: z.string().min(4),
  active: z.boolean(),
  maxDiscount: z.number().int().positive().optional(),
  merchantId: z.string().min(1).optional(),
}).refine((value) => Date.parse(value.endsAt) > Date.parse(value.startsAt), { path: ["endsAt"], message: "The end date must be after the start date." })
  .refine((value) => value.discountType !== "percentage" || value.discountValue <= 90, { path: ["discountValue"], message: "Percentage discounts must be 90 or below." });

export const adminReviewPatchSchema = z.object({ status: z.enum(["visible", "hidden", "flagged"]) });

export const adminAnnouncementSchema = z.object({
  active: z.boolean(),
  offers: z.array(z.object({
    id: z.string().optional(),
    text: z.string().trim().min(5).max(120),
    href: z.string().trim().min(1).max(200),
  })).max(5),
});
