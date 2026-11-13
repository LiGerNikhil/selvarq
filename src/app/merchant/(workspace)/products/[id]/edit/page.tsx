import { notFound } from "next/navigation";
import { categories, products } from "@/data";
import { getMerchantIdentity } from "@/lib/merchant-access";
import { getMerchantCatalogProducts } from "@/lib/demo-merchant-store";
import { MerchantProductEditor } from "@/components/merchant/product-editor";

export default async function EditMerchantProductPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, identity] = await Promise.all([params, getMerchantIdentity()]);
  if (!identity) return null;
  const product = getMerchantCatalogProducts(identity.merchantId).find((item) => item.id === id)
    ?? products.find((item) => item.id === id && item.merchantId === identity.merchantId);
  if (!product) notFound();
  return <MerchantProductEditor categories={categories} merchantId={identity.merchantId} merchantName={identity.profile.name} initialProduct={product} />;
}
