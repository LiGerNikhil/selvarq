import type { Metadata } from "next";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata("New seller product", "/merchant/products/new");

import { getAdminCategories } from "@/lib/admin-store";
import { getMerchantIdentity } from "@/lib/merchant-access";
import { MerchantProductEditor } from "@/components/merchant/product-editor";

export default async function NewMerchantProductPage() {
  const identity = await getMerchantIdentity();
  if (!identity) return null;
  return <MerchantProductEditor categories={getAdminCategories()} merchantId={identity.merchantId} merchantName={identity.profile.name} />;
}
