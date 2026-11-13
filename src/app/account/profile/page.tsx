import { ProfileForm } from "@/components/account/profile-form";
import { getSession } from "@/lib/auth/demo-session";
import { getDemoAccountById } from "@/lib/demo-account-store";

export default async function ProfilePage() {
  const session = await getSession();
  const account = session ? getDemoAccountById(session.userId) : undefined;
  if (!account) return null;
  return <section><p className="eyebrow mb-2">Personal details</p><h2 className="display-md mb-6 text-indigo">Profile</h2><ProfileForm initial={{ name: account.name, email: account.email, phone: account.phone }} /></section>;
}
