import type { Metadata } from "next";
import { WishlistContent } from "@/components/account/wishlist-content";
import { productsRepository } from "@/lib/repo";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata("Your wishlist", "/wishlist");

export default async function WishlistPage() {
  const catalogue = await productsRepository.search({ pageSize: 100 });
  return (
    <main className="page-container min-h-[60vh] py-8 md:py-12">
      <p className="eyebrow mb-2">Pieces to return to</p>
      <h1 className="display-lg mb-8 text-indigo">Your wishlist</h1>
      <WishlistContent products={catalogue.items} />
    </main>
  );
}
