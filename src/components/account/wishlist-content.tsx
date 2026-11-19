"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/data";
import { useWishlistStore } from "@/store/wishlist-store";

export function WishlistContent({ products }: { products: Product[] }) {
  const productIds = useWishlistStore((state) => state.productIds);
  const savedProducts = productIds.map((id) => products.find((product) => product.id === id)).filter((product) => product?.status === "active");
  return savedProducts.length ? (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4">{savedProducts.map((product) => product ? <ProductCard key={product.id} product={product} /> : null)}</div>
  ) : (
    <div className="mx-auto max-w-lg py-12 text-center">
      <Heart aria-hidden className="mx-auto size-10 text-gold-ink" />
      <h2 className="display-md mt-4 text-indigo">Your wishlist is yours to shape</h2>
      <p className="mt-2 text-sm text-muted">Save pieces you would like to revisit. They will be here when you return.</p>
      <Link href="/shop" className="mt-6 inline-flex min-h-11 items-center bg-indigo px-6 text-xs font-medium uppercase tracking-wide text-ivory">Explore the collection</Link>
    </div>
  );
}
