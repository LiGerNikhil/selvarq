import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { MerchantShell } from "@/components/merchant/merchant-shell";
import { getMerchantIdentity } from "@/lib/merchant-access";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata("Seller studio", "/merchant/dashboard");

export default async function MerchantWorkspaceLayout({ children }: { children: ReactNode }) {
  const identity = await getMerchantIdentity();
  if (!identity) redirect("/login?next=%2Fmerchant%2Fdashboard");
  if (identity.profile.status !== "approved") redirect("/merchant/pending");
  return <MerchantShell name={identity.profile.name} merchantId={identity.merchantId}>{children}</MerchantShell>;
}
