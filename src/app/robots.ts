import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/account/",
        "/admin/",
        "/api/",
        "/cart",
        "/checkout",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/onboarding",
        "/merchant/dashboard",
        "/merchant/orders",
        "/merchant/products",
        "/merchant/payouts",
        "/merchant/notifications",
        "/merchant/profile",
        "/merchant/pending",
        "/order/",
        "/styleguide",
        "/search",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
