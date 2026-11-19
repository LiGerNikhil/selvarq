import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/commerce/checkout-flow";
import { getSession } from "@/lib/auth/demo-session";
import { getDemoAccountById } from "@/lib/demo-account-store";
import { couponsRepository, usersRepository } from "@/lib/repo";
import { getAdminSettings } from "@/lib/admin-store";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata("Checkout", "/checkout");

export default async function CheckoutPage() {
  const session = await getSession();
  const user = session?.role === "customer" ? await usersRepository.getById(session.userId) : undefined;
  const account = session?.role === "customer" ? getDemoAccountById(session.userId) : undefined;
  const defaultAddress = account?.addresses.find((address) => address.isDefault) ?? account?.addresses[0];
  const coupons = await couponsRepository.listActive();
  return (
    <main className="page-container min-h-[65vh] py-8 md:py-12">
      <p className="eyebrow mb-2">A considered checkout</p>
      <h1 className="display-lg mb-8 text-indigo">Complete your order</h1>
      <CheckoutFlow initialAddress={user ? {
        name: defaultAddress?.fullName ?? user.name,
        email: user.email,
        phone: defaultAddress?.phone ?? account?.phone ?? "",
        line1: defaultAddress?.line1 ?? "",
        line2: defaultAddress?.line2 ?? "",
        city: defaultAddress?.city ?? "",
        state: defaultAddress?.state ?? "",
        pincode: defaultAddress?.pincode ?? "",
      } : undefined} coupons={coupons} settings={getAdminSettings()} />
    </main>
  );
}
