import type { Metadata } from "next";
import { MerchantProductEditor } from "@/components/merchant/product-editor";
import { getAdminCategories } from "@/lib/admin-store";
import { PLATFORM_SELLER } from "@/lib/config";

export const metadata: Metadata = { title: "New admin product" };

export default function AdminNewProductPage() {
  return (
    <MerchantProductEditor
      mode="admin"
      categories={getAdminCategories()}
      merchantId={PLATFORM_SELLER.id}
      merchantName={PLATFORM_SELLER.name}
    />
  );
}