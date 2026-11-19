import type { Metadata } from "next";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata("Collection", "/shop");

import { redirect } from "next/navigation";

export default async function LegacyCollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/collection/${encodeURIComponent(slug)}`);
}
