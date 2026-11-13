import Link from "next/link";
import { AuthPanel } from "@/components/auth/auth-panel";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return <AuthPanel eyebrow="A more considered wardrobe" title="Create an account" description="Save your favourites, keep your orders close and discover pieces picked for you.">
    <RegisterForm />
    <p className="mt-6 text-center text-sm text-muted">Already have an account? <Link href="/login" className="text-indigo underline underline-offset-4">Sign in</Link></p>
  </AuthPanel>;
}
