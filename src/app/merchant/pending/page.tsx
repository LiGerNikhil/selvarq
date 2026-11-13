import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { getMerchantIdentity } from "@/lib/merchant-access";
import { getMerchantApplicationByOwner } from "@/lib/demo-merchant-store";
import { formatDate } from "@/lib/format";

export default async function MerchantPendingPage() {
  const identity = await getMerchantIdentity();
  if (!identity) redirect("/login?next=%2Fmerchant%2Fpending");
  if (identity.profile.status === "approved") redirect("/merchant/dashboard");
  const application = getMerchantApplicationByOwner(identity.session.userId);
  return <main className="page-container flex min-h-[65vh] max-w-3xl flex-col justify-center py-16">
    <Badge variant="gold">Application received</Badge>
    <h1 className="display-lg mt-5 text-indigo">Your seller application is under review.</h1>
    <p className="body mt-4 max-w-2xl">Thank you, {identity.account?.name}. We have received the application for {application?.displayName ?? identity.profile.name}. The SELVARQ team will review your business details and supporting documents before enabling seller tools.</p>
    <div className="mt-8 grid gap-3 border border-line bg-ivory p-5 text-sm sm:grid-cols-2">
      <p><span className="caption block">Application status</span><strong className="font-medium">Pending approval</strong></p>
      <p><span className="caption block">Submitted</span>{application ? formatDate(application.createdAt) : "Demo profile"}</p>
      <p><span className="caption block">Business</span>{application?.businessName ?? identity.profile.name}</p>
      <p><span className="caption block">Documents received</span>{application?.documents.length ?? 0}</p>
    </div>
    <p className="caption mt-4">This is a demo workflow. Applications and file names are held in process memory and no real documents are uploaded.</p>
    <div className="mt-7 flex flex-wrap gap-3"><ButtonLink href="/sell" variant="ghost">Seller information</ButtonLink><Link href="/login" className="inline-flex min-h-11 items-center px-4 text-sm text-indigo underline">Sign in later</Link></div>
  </main>;
}
