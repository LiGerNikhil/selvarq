import type { Metadata } from "next";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata("Category", "/shop");

import { redirect } from "next/navigation";

export default async function LegacyCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/category/${encodeURIComponent(slug)}`);
}
