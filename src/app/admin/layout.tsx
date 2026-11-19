import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminIdentity } from "@/lib/admin-access";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata("Admin studio", "/admin");

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const identity = await getAdminIdentity();
  if (!identity) redirect("/login?next=%2Fadmin");
  return <AdminShell name={identity.account.name}>{children}</AdminShell>;
}