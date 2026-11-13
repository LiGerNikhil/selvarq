import { ArrowRight } from "lucide-react";
import { merchants } from "@/data";
import { getMerchantIdentity } from "@/lib/merchant-access";
import { MerchantProfileForm } from "@/components/merchant/profile-form";

export default async function MerchantProfilePage() {
  const identity = await getMerchantIdentity();
  if (!identity) return null;
  const publicStorefront = merchants.some((merchant) => merchant.id === identity.merchantId) ? identity.profile.slug : undefined;
  return <div><p className="eyebrow">Public store details</p><div className="mt-1 flex flex-wrap items-end justify-between gap-3"><h2 className="display-md text-indigo">Storefront profile</h2>{publicStorefront ? <a href={`/merchant/${publicStorefront}/store`} className="inline-flex min-h-11 items-center gap-2 text-sm text-indigo underline underline-offset-4">View public storefront <ArrowRight aria-hidden className="size-4" /></a> : null}</div><p className="body mt-2 max-w-2xl">Keep the maker story shoppers see on your public storefront up to date.</p><MerchantProfileForm profile={{ displayName: identity.profile.name, bio: identity.profile.bio, city: identity.profile.city, logoId: identity.profile.logoId }} /></div>;
}
