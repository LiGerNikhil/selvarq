import type { Metadata } from "next";
import { CartPage } from "@/components/commerce/cart-page";
import { couponsRepository } from "@/lib/repo";

export const metadata: Metadata = { title: "Your bag" };

export default async function CartRoute() {
  const coupons = await couponsRepository.listActive();
  return <main className="page-container min-h-[60vh] py-8 md:py-12"><p className="eyebrow mb-2">Your considered choices</p><h1 className="display-lg mb-8 text-indigo">Your bag</h1><div id="cart-items"><CartPage coupons={coupons} /></div></main>;
}
