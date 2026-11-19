import type { Metadata } from "next";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata("Product", "/shop");

import { permanentRedirect } from "next/navigation";

export default async function LegacyProductRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  permanentRedirect(`/product/${slug}`);
}
