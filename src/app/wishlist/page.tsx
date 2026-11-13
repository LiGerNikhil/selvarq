"use client";

import { WishlistContent } from "@/components/account/wishlist-content";

export default function WishlistPage() {
  return (
    <main className="page-container min-h-[60vh] py-8 md:py-12">
      <p className="eyebrow mb-2">Pieces to return to</p>
      <h1 className="display-lg mb-8 text-indigo">Your wishlist</h1>
      <WishlistContent />
    </main>
  );
}
