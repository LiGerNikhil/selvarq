import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { AdminPageHeader, AdminSection } from "@/components/admin/admin-ui";
import { DetailRow } from "@/components/admin/data-table";
import { DocumentVerifyButton, MerchantCommissionForm, MerchantStatusActions } from "@/components/admin/merchant-actions";
import { getAdminMerchant, getAdminProducts, getAdminSettings } from "@/lib/admin-store";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Merchant review" };

export default async function AdminMerchantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const merchant = getAdminMerchant(id);
  if (!merchant) notFound();
  const settings = getAdminSettings();
  const products = getAdminProducts().filter((product) => product.merchantId === merchant.id);
  const approvedDocuments = merchant.documents.filter((document) => document.verified).length;
  const canApprove = approvedDocuments === merchant.documents.length && merchant.documents.length > 0;

  return (
    <>
      <AdminPageHeader
        eyebrow="Merchant review"
        title={merchant.name}
        description={`${merchant.businessName} · ${merchant.city} · joined ${formatDate(merchant.joinedAt)}`}
        actions={<ButtonLink href="/admin/merchants" variant="ghost">Back to merchants</ButtonLink>}
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,1fr)]">
        <div className="space-y-6">
          <AdminSection title="Application" description="Business details supplied by the seller">
            <dl className="px-4 py-2">
              <DetailRow label="Status">
                <Badge variant={merchant.status === "pending" ? "gold" : merchant.status === "approved" ? "success" : merchant.status === "suspended" ? "danger" : "outline"}>{merchant.status}</Badge>
              </DetailRow>
              <DetailRow label="Owner">{merchant.name}</DetailRow>
              <DetailRow label="Email">{merchant.email ?? "Not provided"}</DetailRow>
              <DetailRow label="Phone">{merchant.phone ?? "Not provided"}</DetailRow>
              <DetailRow label="GST">{merchant.gstDeclaration === "registered" ? merchant.gstin ?? "Registered" : "Unregistered declaration"}</DetailRow>
              <DetailRow label="PAN">{merchant.pan}</DetailRow>
              <DetailRow label="Storefront"><Link href={`/merchant/${merchant.slug}/store`} className="text-indigo underline-offset-4 hover:underline">View public store</Link></DetailRow>
            </dl>
          </AdminSection>

          <AdminSection title="KYC documents" description={`${approvedDocuments} of ${merchant.documents.length} verified. Files are demo placeholders.`}>
            <ul className="divide-y divide-line">
              {merchant.documents.map((document) => (
                <li key={document.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <FileText aria-hidden className="mt-0.5 size-5 text-muted" />
                    <div>
                      <p className="text-sm font-medium">{document.type.replaceAll("_", " ")}</p>
                      <p className="caption mt-1">{document.fileName} · uploaded {formatDate(document.uploadedAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={document.verified ? "success" : "gold"}>{document.verified ? "Verified" : "Pending"}</Badge>
                    <DocumentVerifyButton merchantId={merchant.id} documentId={document.id} verified={document.verified} />
                  </div>
                </li>
              ))}
            </ul>
          </AdminSection>

          <AdminSection title="Bank & pickup" description="Used for payouts and dispatch">
            <div className="grid gap-6 p-4 sm:grid-cols-2">
              <dl>
                <DetailRow label="Account holder">{merchant.bank.accountHolder}</DetailRow>
                <DetailRow label="Account number">{merchant.bank.accountNumber}</DetailRow>
                <DetailRow label="IFSC">{merchant.bank.ifsc}</DetailRow>
                <DetailRow label="Bank">{merchant.bank.bankName}</DetailRow>
              </dl>
              <dl>
                <DetailRow label="Pickup line">{merchant.pickupAddress.line1}</DetailRow>
                <DetailRow label="City">{merchant.pickupAddress.city}</DetailRow>
                <DetailRow label="State">{merchant.pickupAddress.state}</DetailRow>
                <DetailRow label="Pincode">{merchant.pickupAddress.pincode}</DetailRow>
              </dl>
            </div>
          </AdminSection>

          <AdminSection title="Listings" description={`${products.length} products owned by this merchant`}>
            {products.length ? (
              <ul className="divide-y divide-line">
                {products.slice(0, 8).map((product) => (
                  <li key={product.id} className="flex items-center justify-between gap-3 p-4">
                    <span className="min-w-0 truncate text-sm">{product.name}</span>
                    <Badge variant={product.status === "active" ? "success" : "outline"}>{product.status}</Badge>
                  </li>
                ))}
              </ul>
            ) : <p className="p-4 text-sm text-muted">No listings yet.</p>}
          </AdminSection>
        </div>

        <div className="space-y-6">
          <AdminSection title="Decision" description={canApprove ? "All documents are verified." : "Verify every document before approving."}>
            <div className="p-4">
              <MerchantStatusActions merchantId={merchant.id} status={merchant.status} />
              {merchant.status === "rejected" && merchant.rejectionReason ? <p className="caption mt-3 text-danger">Rejected: {merchant.rejectionReason}</p> : null}
            </div>
          </AdminSection>

          <AdminSection title="Commission" description={`Platform default is ${settings.defaultCommissionRate}%.`}>
            <div className="p-4"><MerchantCommissionForm merchantId={merchant.id} rate={merchant.commissionRate} /></div>
          </AdminSection>

          <AdminSection title="Store status" description="One decision per seller">
            <ul className="divide-y divide-line text-sm">
              <li className="flex items-center justify-between gap-3 p-4"><span>Products live</span><span>{products.filter((product) => product.status === "active").length}</span></li>
              <li className="flex items-center justify-between gap-3 p-4"><span>Documents verified</span><span>{approvedDocuments}/{merchant.documents.length}</span></li>
              <li className="flex items-center justify-between gap-3 p-4"><span>Owner account</span><span className="text-muted">{merchant.ownerUserId ? "Linked" : "Seed merchant"}</span></li>
            </ul>
          </AdminSection>
        </div>
      </div>
    </>
  );
}