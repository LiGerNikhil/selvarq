import type { Metadata } from "next";
import { MerchantRegistrationForm } from "@/components/merchant/registration-form";

export const metadata: Metadata = { title: "Seller application", robots: { index: false, follow: false } };

export default function MerchantRegisterPage() {
  return <main className="page-container max-w-5xl py-10 md:py-16"><p className="eyebrow">Sell on SELVARQ</p><h1 className="display-lg mt-2 text-indigo">Seller application</h1><p className="body mt-3 max-w-2xl">A few details about you, your business and the work you make. Your application will be reviewed before your store can publish products.</p><MerchantRegistrationForm /></main>;
}
