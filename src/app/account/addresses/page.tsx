import { AddressManager } from "@/components/account/address-manager";
import { getSession } from "@/lib/auth/demo-session";
import { getDemoAccountById } from "@/lib/demo-account-store";

export default async function AddressesPage() {
  const session = await getSession();
  const account = session ? getDemoAccountById(session.userId) : undefined;
  if (!account) return null;
  return <section><p className="eyebrow mb-2">Where we can deliver</p><h2 className="display-md mb-6 text-indigo">Your addresses</h2><AddressManager initial={account.addresses} /></section>;
}
