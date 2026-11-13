import { categories } from "@/data";
import { getMerchantIdentity } from "@/lib/merchant-access";
import { MerchantProductEditor } from "@/components/merchant/product-editor";

export default async function NewMerchantProductPage() {
  const identity = await getMerchantIdentity();
  if (!identity) return null;
  return <MerchantProductEditor categories={categories} merchantId={identity.merchantId} merchantName={identity.profile.name} />;
}
