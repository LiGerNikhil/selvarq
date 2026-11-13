"use client";

import { useEffect } from "react";
import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/data";
import { useRecentlyViewedStore } from "@/store/recently-viewed-store";

export function ProductRecommendations({ title, products }: { title: string; products: Product[] }) {
  if (!products.length) return null;
  return (
    <section className="py-10 md:py-14" aria-label={title}>
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="display-lg text-indigo">{title}</h2>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4">
        {products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}

export function RecentlyViewed({ currentProductId, products }: { currentProductId: string; products: Product[] }) {
  const viewedIds = useRecentlyViewedStore((state) => state.productIds);
  const add = useRecentlyViewedStore((state) => state.add);

  useEffect(() => { add(currentProductId); }, [add, currentProductId]);

  const byId = new Map(products.map((product) => [product.id, product]));
  const viewed = viewedIds
    .filter((id) => id !== currentProductId)
    .map((id) => byId.get(id))
    .filter((product): product is Product => Boolean(product))
    .slice(0, 4);
  if (!viewed.length) return null;

  return (
    <section className="py-10 md:py-14" aria-label="Recently viewed products">
      <h2 className="display-lg mb-6 text-indigo">Recently viewed</h2>
      <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4">
        {viewed.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}
