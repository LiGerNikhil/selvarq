import { z } from "zod";

export const checkoutAddressSchema = z.object({
  name: z.string().trim().min(2, "Enter the recipient's name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(254),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  line1: z.string().trim().min(5, "Enter a complete address").max(160),
  line2: z.string().trim().max(160).optional().default(""),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  pincode: z.string().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit pincode"),
});

export const checkoutPaymentSchema = z.discriminatedUnion("method", [
  z.object({ method: z.literal("upi"), vpa: z.string().trim().regex(/^[\w.-]{2,}@[a-zA-Z]{2,}$/, "Enter a valid UPI ID") }),
  z.object({ method: z.literal("card"), cardNumber: z.string().regex(/^\d{16}$/, "Enter a 16-digit card number"), expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY"), cvv: z.string().regex(/^\d{3,4}$/, "Enter a valid CVV") }),
  z.object({ method: z.literal("netbanking"), bank: z.string().min(2, "Choose a bank") }),
  z.object({ method: z.literal("cod") }),
]);

export const checkoutSchema = z.object({
  address: checkoutAddressSchema,
  deliveryMethod: z.enum(["standard", "express"]),
  payment: checkoutPaymentSchema,
  paymentOutcome: z.enum(["success", "failure"]),
  couponCode: z.string().trim().max(32).default(""),
  items: z.array(z.object({
    productId: z.string().min(1),
    variantId: z.string().min(1),
    quantity: z.number().int().min(1).max(10),
    expectedPrice: z.number().int().positive(),
  })).min(1, "Your bag is empty").max(50),
}).superRefine((value, context) => {
  if (value.payment.method === "cod" && value.paymentOutcome === "failure") {
    context.addIssue({ code: "custom", path: ["paymentOutcome"], message: "Cash on delivery does not use a simulated payment result." });
  }
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CheckoutPayment = CheckoutInput["payment"];
