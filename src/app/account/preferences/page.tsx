import type { Metadata } from "next";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata("Preferences", "/account/preferences");

import { PreferencesForm } from "@/components/account/preferences-form";
import { getAdminCategories } from "@/lib/admin-store";
import { getSession } from "@/lib/auth/demo-session";
import { getDemoAccountById } from "@/lib/demo-account-store";

export default async function AccountPreferencesPage() {
  const session = await getSession();
  const account = session ? getDemoAccountById(session.userId) : undefined;
  if (!account) return null;
  return <section><p className="eyebrow mb-2">Made more personal</p><h2 className="display-md mb-3 text-indigo">Your preferences</h2><p className="mb-6 max-w-xl text-sm text-muted">Your choices shape the For you rail on the homepage. Update them whenever your style changes.</p><PreferencesForm initial={account.preferences} categories={getAdminCategories().filter((category) => category.parentId !== null)} /></section>;
}
