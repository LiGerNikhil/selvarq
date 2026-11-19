import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MerchantProductEditor } from "@/components/merchant/product-editor";
import { getAdminCategories, getAdminProduct } from "@/lib/admin-store";
import { PLATFORM_SELLER } from "@/lib/config";

export const metadata: Metadata = { title: "Edit admin product" };

export default async function AdminEditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getAdminProduct(id);
  if (!product) notFound();
  return (
    <MerchantProductEditor
      mode="admin"
      categories={getAdminCategories()}
      merchantId={PLATFORM_SELLER.id}
      merchantName={PLATFORM_SELLER.name}
      initialProduct={product}
    />
  );
}