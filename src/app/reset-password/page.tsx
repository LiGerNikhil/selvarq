import Link from "next/link";
import { AuthPanel } from "@/components/auth/auth-panel";
import { ResetPasswordForm } from "@/components/auth/password-forms";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const params = await searchParams;
  return <AuthPanel eyebrow="Account access" title="Choose a new password" description="Set a new password for this demo account.">
    <ResetPasswordForm token={params.token ?? ""} />
    <p className="mt-6 text-center text-sm"><Link href="/login" className="text-indigo underline underline-offset-4">Back to sign in</Link></p>
  </AuthPanel>;
}
