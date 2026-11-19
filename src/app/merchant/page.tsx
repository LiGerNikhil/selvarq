import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata("Seller studio", "/merchant");

export default function MerchantEntryPage() {
  redirect("/merchant/dashboard");
}
