import type { MetadataRoute } from "next";
import { getAdminCategories, getAdminCollections, getAdminMerchants, getAdminStories } from "@/lib/admin-store";
import { getPublicDemoProducts } from "@/lib/demo-merchant-store";
import { absoluteUrl } from "@/lib/seo";

type Entry = MetadataRoute.Sitemap[number];

function entry(path: string, changeFrequency: Entry["changeFrequency"], priority: number, lastModified: Date = new Date()): Entry {
  return { url: absoluteUrl(path), lastModified, changeFrequency, priority };
}

/** Public, indexable routes only. Account, admin, checkout and auth flows are intentionally omitted. */
export default function sitemap(): MetadataRoute.Sitemap {
  const reviewed = new Date("2026-11-17T00:00:00.000Z");

  const routes: Entry[] = [
    entry("/", "daily", 1),
    entry("/shop", "daily", 0.9),
    entry("/about", "monthly", 0.6, reviewed),
    entry("/contact", "monthly", 0.5, reviewed),
    entry("/shipping", "monthly", 0.5, reviewed),
    entry("/returns", "monthly", 0.5, reviewed),
    entry("/privacy", "yearly", 0.3, reviewed),
    entry("/terms", "yearly", 0.3, reviewed),
    entry("/size-guide", "monthly", 0.5, reviewed),
    entry("/faq", "monthly", 0.5, reviewed),
    entry("/track", "monthly", 0.4, reviewed),
    entry("/stories", "weekly", 0.5),
    entry("/sell", "monthly", 0.6),
  ];

  const pages: Entry[] = getAdminCategories().map((category) => entry(`/category/${category.slug}`, "weekly", 0.7));
  const edits: Entry[] = getAdminCollections().map((collection) => entry(`/collection/${collection.slug}`, "weekly", 0.7));
  const stories: Entry[] = getAdminStories().map((story) => entry(`/stories/${story.slug}`, "monthly", 0.5, new Date(story.publishedAt)));
  const stores: Entry[] = getAdminMerchants()
    .filter((merchant) => merchant.status === "approved")
    .map((merchant) => entry(`/merchant/${merchant.slug}/store`, "weekly", 0.6));
  const catalogue: Entry[] = getPublicDemoProducts()
    .filter((product) => product.status === "active")
    .map((product) => entry(`/product/${product.slug}`, "weekly", 0.8, reviewed));

  return [...routes, ...pages, ...edits, ...stories, ...stores, ...catalogue];
}
