"use client";

import Link from "next/link";
import { Tabs } from "@/components/ui/tabs";
import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/data";

export function HomeProductTabs({ newArrivals, bestsellers }: { newArrivals: Product[]; bestsellers: Product[] }) {
  return (
    <Tabs
      label="Product edit"
      defaultValue="new"
      items={[
        { id: "new", label: "New arrivals", content: <ProductGrid products={newArrivals} /> },
        { id: "best", label: "Bestsellers", content: <ProductGrid products={bestsellers} /> },
      ]}
      className="mt-7"
    />
  );
}

function ProductGrid({ products }: { products: Product[] }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
        {products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
      <div className="mt-8 text-center">
        <Link href="/shop" className="inline-flex min-h-11 items-center border-b border-gold px-2 text-xs font-medium uppercase tracking-[0.14em] text-indigo hover:text-gold-ink">
          View all clothing
        </Link>
      </div>
    </>
  );
}
