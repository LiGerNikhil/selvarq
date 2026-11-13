import { products } from "@/data";
import { getMerchantIdentity } from "@/lib/merchant-access";
import { getMerchantCatalogProducts } from "@/lib/demo-merchant-store";
import { MerchantProductList } from "@/components/merchant/product-list";

export default async function MerchantProductsPage() {
  const identity = await getMerchantIdentity();
  if (!identity) return null;
  const storedProducts = getMerchantCatalogProducts(identity.merchantId);
  const storedIds = new Set(storedProducts.map((product) => product.id));
  const ownProducts = [...storedProducts, ...products.filter((product) => product.merchantId === identity.merchantId && !storedIds.has(product.id))];
  return <div><p className="eyebrow">Catalogue</p><div className="mt-1 flex flex-wrap items-end justify-between gap-3"><h2 className="display-md text-indigo">Products</h2><p className="caption">{ownProducts.length} listings</p></div><MerchantProductList products={ownProducts} /></div>;
}
