import type { Metadata } from "next";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata("Wishlist", "/account/wishlist");

import { WishlistContent } from "@/components/account/wishlist-content";
import { productsRepository } from "@/lib/repo";

export default async function AccountWishlistPage() {
  const catalogue = await productsRepository.search({ pageSize: 100 });
  return <section><p className="eyebrow mb-2">Pieces to return to</p><h2 className="display-md mb-6 text-indigo">Your wishlist</h2><WishlistContent products={catalogue.items} /></section>;
}
