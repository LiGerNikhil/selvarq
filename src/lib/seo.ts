import type { Metadata } from "next";
import { BRAND } from "@/lib/config";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** Absolute URL for canonical, Open Graph and structured data fields. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export interface PageSeoInput {
  title: string;
  description: string;
  path: string;
  /** Open Graph image path or absolute URL. */
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
  type?: "website" | "article";
  noIndex?: boolean;
}

export function pageMetadata({ title, description, path, image, imageWidth = 1200, imageHeight = 630, imageAlt, type = "website", noIndex = false }: PageSeoInput): Metadata {
  const url = absoluteUrl(path);
  const socialImage = image ?? "/brand/og-default.png";
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${BRAND.name}`,
      description,
      url,
      siteName: BRAND.name,
      locale: "en_IN",
      type,
      images: [{ url: absoluteUrl(socialImage), width: imageWidth, height: imageHeight, alt: imageAlt ?? `${BRAND.name} — ${BRAND.tagline}` }],
    },
    twitter: { card: "summary_large_image", title: `${title} | ${BRAND.name}`, description, images: [{ url: absoluteUrl(socialImage), alt: imageAlt ?? `${BRAND.name} — ${BRAND.tagline}` }] },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

/** Metadata for role-gated, transactional or utility routes that must not be indexed. */
export function privateMetadata(title: string, path: string, description = "This page is part of the SELVARQ demonstration storefront."): Metadata {
  return pageMetadata({ title, description, path, noIndex: true });
}

export interface CrumbInput {
  name: string;
  path?: string;
}

export function breadcrumbJsonLd(items: CrumbInput[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      // The current page may omit its URL, which keeps the trail valid without
      // inventing a path when the last crumb is rendered as plain text.
      ...(item.path ? { item: absoluteUrl(item.path) } : {}),
    })),
  };
}
