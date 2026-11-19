import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AccountShell } from "@/components/account/account-shell";
import { requireRole } from "@/lib/auth/demo-session";
import { getDemoAccountById } from "@/lib/demo-account-store";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata("Your account", "/account");

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const session = await requireRole(["customer"], "/account");
  const account = getDemoAccountById(session.userId);
  return <AccountShell name={account?.name ?? "Customer"}>{children}</AccountShell>;
}
