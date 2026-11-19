import type { Metadata } from "next";
import Link from "next/link";
import { AuthPanel } from "@/components/auth/auth-panel";
import { LoginForm } from "@/components/auth/login-form";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata("Sign in", "/login");

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  return <AuthPanel eyebrow="Welcome back" title="Sign in" description="Sign in to shop, or to manage an approved seller studio.">
    <LoginForm next={params.next} />
    <p className="mt-6 text-center text-sm text-muted">New to SELVARQ? <Link href="/register" className="text-indigo underline underline-offset-4">Create account</Link></p>
  </AuthPanel>;
}
