import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/account/onboarding-form";
import { requireRole } from "@/lib/auth/demo-session";
import { getDemoAccountById } from "@/lib/demo-account-store";
import { getAdminCategories } from "@/lib/admin-store";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata("Set up your profile", "/onboarding");

export default async function OnboardingPage() {
  const session = await requireRole(["customer"], "/onboarding");
  const account = getDemoAccountById(session.userId);
  if (!account) redirect("/login");
  if (account.preferences.onboardingComplete) redirect("/");
  return <main className="page-container py-12 md:py-20">
    <section className="mx-auto max-w-2xl border border-line bg-ivory p-5 sm:p-8">
      <p className="eyebrow mb-2">A small introduction</p>
      <h1 className="display-lg text-indigo">Make it yours</h1>
      <p className="mb-7 mt-3 text-sm text-muted">Three quick steps help us bring the right pieces closer. This is optional and editable later.</p>
      <OnboardingForm categories={getAdminCategories().filter((category) => category.parentId !== null)} initial={account.preferences} />
    </section>
  </main>;
}
