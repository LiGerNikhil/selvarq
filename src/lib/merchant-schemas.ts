import { z } from "zod";

const phone = z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number.");
const address = z.object({
  line1: z.string().trim().min(5, "Enter a complete pickup address.").max(160),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  pincode: z.string().regex(/^\d{6}$/, "Enter a 6-digit PIN code."),
});

export const merchantApplicationSchema = z.object({
  ownerName: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  phone,
  password: z.string().min(8).max(72),
  businessName: z.string().trim().min(2).max(100),
  displayName: z.string().trim().min(2).max(60),
  city: z.string().trim().min(2).max(80),
  gstDeclaration: z.enum(["registered", "unregistered"]),
  gstin: z.string().trim().toUpperCase().regex(/^[0-9A-Z]{15}$/, "Enter a valid 15-character GSTIN.").optional().or(z.literal("")),
  pan: z.string().trim().toUpperCase().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Enter a valid PAN."),
  bank: z.object({
    accountHolder: z.string().trim().min(2).max(100),
    accountNumber: z.string().trim().regex(/^\d{8,18}$/, "Enter an 8–18 digit account number."),
    ifsc: z.string().trim().toUpperCase().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC code."),
    bankName: z.string().trim().min(2).max(100),
  }),
  pickupAddress: address,
  bio: z.string().trim().min(40, "Tell us at least 40 characters about your label.").max(600),
  logoName: z.string().min(1, "Choose a brand logo image."),
  documents: z.array(z.object({
    type: z.enum(["pan_card", "gst_certificate", "cancelled_cheque", "address_proof", "other"]),
    fileName: z.string().min(1),
  })).min(1, "Upload at least one supporting document."),
  termsAccepted: z.boolean().refine((value) => value, "Please accept the seller terms."),
}).superRefine((value, context) => {
  if (value.gstDeclaration === "registered" && !value.gstin) {
    context.addIssue({ code: "custom", path: ["gstin"], message: "Enter your GSTIN or choose the unregistered declaration." });
  }
});

export const merchantProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(3).max(120),
  categoryId: z.string().min(1),
  description: z.string().trim().min(20).max(600),
  story: z.string().trim().min(30).max(1200),
  imageIds: z.array(z.string().min(1)).min(3).max(6),
  colors: z.array(z.object({ name: z.string().trim().min(2), hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/) })).min(1).max(6),
  sizes: z.array(z.enum(["XS", "S", "M", "L", "XL", "XXL"])).min(1),
  variants: z.array(z.object({
    id: z.string().min(1),
    color: z.string().min(1),
    colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    size: z.enum(["XS", "S", "M", "L", "XL", "XXL"]),
    sku: z.string().trim().min(2).max(40),
    stock: z.number().int().min(0).max(10000),
    price: z.number().int().positive(),
  })).min(1),
  price: z.number().int().positive(),
  mrp: z.number().int().positive(),
  fabric: z.string().trim().min(2).max(80),
  fit: z.string().trim().min(2).max(80),
  care: z.array(z.string().trim().min(2)).min(1).max(8),
  highlights: z.array(z.string().trim().min(2)).min(1).max(8),
  tags: z.array(z.string().trim().min(2)).max(12),
  seo: z.object({ title: z.string().trim().min(5).max(70), description: z.string().trim().min(20).max(160) }),
  status: z.enum(["active", "draft"]),
}).refine((value) => value.mrp >= value.price, { path: ["mrp"], message: "MRP must be equal to or above selling price." });

export const merchantFulfilmentSchema = z.object({
  status: z.enum(["accepted", "packed", "shipped", "delivered", "return_requested", "returned"]),
  courier: z.string().trim().max(80).optional(),
  awb: z.string().trim().max(80).optional(),
}).superRefine((value, context) => {
  if (value.status === "shipped" && (!value.courier || !value.awb)) {
    context.addIssue({ code: "custom", path: ["awb"], message: "Add courier and AWB before marking the order shipped." });
  }
});

export const merchantProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(60),
  bio: z.string().trim().min(40).max(600),
  city: z.string().trim().min(2).max(80),
  logoId: z.string().min(1),
});

export type MerchantApplicationInput = z.infer<typeof merchantApplicationSchema>;
export type MerchantProductInputValidated = z.infer<typeof merchantProductSchema>;
