import type { Metadata } from "next";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata("Edit seller product", "/merchant/products");

import { notFound } from "next/navigation";
import { getAdminCategories } from "@/lib/admin-store";
import { getMerchantIdentity } from "@/lib/merchant-access";
import { getMerchantCatalogProducts } from "@/lib/demo-merchant-store";
import { MerchantProductEditor } from "@/components/merchant/product-editor";

export default async function EditMerchantProductPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, identity] = await Promise.all([params, getMerchantIdentity()]);
  if (!identity) return null;
  const product = getMerchantCatalogProducts(identity.merchantId).find((item) => item.id === id);
  if (!product) notFound();
  return <MerchantProductEditor categories={getAdminCategories()} merchantId={identity.merchantId} merchantName={identity.profile.name} initialProduct={product} />;
}
