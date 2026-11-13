import Link from "next/link";
import { AuthPanel } from "@/components/auth/auth-panel";
import { ForgotPasswordForm } from "@/components/auth/password-forms";

export default function ForgotPasswordPage() {
  return <AuthPanel eyebrow="Account access" title="Reset password" description="Enter the email or mobile linked to your demo account.">
    <ForgotPasswordForm />
    <p className="mt-6 text-center text-sm"><Link href="/login" className="text-indigo underline underline-offset-4">Back to sign in</Link></p>
  </AuthPanel>;
}
