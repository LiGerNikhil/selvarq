import { z } from "zod";

const envSchema = z.object({
  DATA_SOURCE: z.enum(["mock", "mongo"]).default("mock"),
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
});

/** Validated server-side environment. Only "mock" is implemented until P13. */
export const env = envSchema.parse({
  DATA_SOURCE: process.env.DATA_SOURCE || undefined,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
});
