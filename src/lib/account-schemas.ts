import { z } from "zod";

const emailSchema = z.string().trim().email("Enter a valid email address.");
const phoneSchema = z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number.");
const passwordSchema = z.string().min(8, "Use at least 8 characters.").max(72);

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(80),
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  consent: z.boolean().refine((value) => value, "Please accept the terms and privacy policy."),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Enter your email or mobile number."),
  method: z.enum(["password", "otp"]),
  password: z.string().optional(),
  otp: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.method === "password" && !data.password) ctx.addIssue({ code: "custom", path: ["password"], message: "Enter your password." });
  if (data.method === "otp" && !/^\d{6}$/.test(data.otp ?? "")) ctx.addIssue({ code: "custom", path: ["otp"], message: "Enter the 6-digit demo OTP." });
});

export const forgotPasswordSchema = z.object({ identifier: z.string().trim().min(1, "Enter your email or mobile number.") });
export const resetPasswordSchema = z.object({ token: z.string().min(1), password: passwordSchema, confirmPassword: z.string() })
  .refine((value) => value.password === value.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match." });

export const profileSchema = z.object({ name: z.string().trim().min(2).max(80), email: emailSchema, phone: phoneSchema });

export const addressSchema = z.object({
  id: z.string().optional(),
  label: z.enum(["Home", "Work", "Other"]),
  fullName: z.string().trim().min(2, "Enter the recipient name."),
  phone: phoneSchema,
  line1: z.string().trim().min(5, "Enter a complete address."),
  line2: z.string().trim().max(120).optional(),
  landmark: z.string().trim().max(100).optional(),
  city: z.string().trim().min(2),
  state: z.string().trim().min(2),
  pincode: z.string().regex(/^\d{6}$/, "Enter a 6-digit PIN code."),
  isDefault: z.boolean(),
});

export const preferencesSchema = z.object({
  gender: z.enum(["men", "women", "unisex", "no_preference"]),
  styles: z.array(z.string()).max(6),
  usualSizes: z.array(z.string()).max(7),
  favoriteCategories: z.array(z.string()).max(12),
  onboardingComplete: z.boolean(),
});

export const notificationSchema = z.object({
  email: z.boolean(),
  sms: z.boolean(),
  orderUpdates: z.boolean(),
});

export const orderRequestSchema = z.object({
  type: z.enum(["cancel", "return", "exchange"]),
  reason: z.string().trim().min(5, "Please tell us a little more.").max(400),
});
