import { z } from "zod";

const optionalText = z.string().trim().min(1).optional();

const envSchema = z.object({
  DATA_SOURCE: z.enum(["mock", "mongo"]).default("mock"),
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  MONGODB_URI: optionalText,
  MONGODB_DB: z.string().trim().min(1).default("selvarq"),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: optionalText,
  CLOUDINARY_API_KEY: optionalText,
  CLOUDINARY_API_SECRET: optionalText,
});

/**
 * Validated server-side environment.
 *
 * `DATA_SOURCE` stays "mock" until the MongoDB repositories are enabled with a
 * real `MONGODB_URI`. Cloudinary is optional at boot: when the cloud name, key
 * and secret are all present, uploads work and public ids resolve to delivery
 * URLs; otherwise the app keeps using the generated placeholder art.
 */
export const env = envSchema.parse({
  DATA_SOURCE: process.env.DATA_SOURCE || undefined,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
  MONGODB_URI: process.env.MONGODB_URI || undefined,
  MONGODB_DB: process.env.MONGODB_DB || undefined,
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || undefined,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || undefined,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || undefined,
});

export const cloudinaryConfig = {
  cloudName: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "",
  apiKey: env.CLOUDINARY_API_KEY ?? "",
  apiSecret: env.CLOUDINARY_API_SECRET ?? "",
} as const;

/** True when the server can sign and send uploads to Cloudinary. */
export function isCloudinaryConfigured(): boolean {
  return Boolean(cloudinaryConfig.cloudName && cloudinaryConfig.apiKey && cloudinaryConfig.apiSecret);
}
