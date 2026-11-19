import type { Metadata } from "next";
import { InfoPage } from "@/components/content/info-page";
import { pageMetadata } from "@/lib/seo";
import { getAdminSettings } from "@/lib/admin-store";

export const metadata: Metadata = pageMetadata({
  title: "Returns & exchange",
  description: "How to return an eligible SELVARQ piece, request an exchange and understand refund timelines.",
  path: "/returns",
});

// The return window is an admin setting; render per request so edits show up.
export const dynamic = "force-dynamic";

export default function ReturnsPage() {
  const settings = getAdminSettings();
  return (
    <InfoPage
      eyebrow="Returns"
      title="Returns & exchange"
      intro={`We want you to keep what you love. Eligible pieces can be returned within ${settings.returnWindowDays} days of delivery, unworn and with original tags.`}
      crumbs={[{ label: "Home", href: "/" }, { label: "Returns & exchange" }]}
      updated="November 2026"
      sections={[
        {
          id: "eligibility",
          title: "What can be returned",
          body: [
            "Unworn, unwashed clothing with tags attached and no signs of use. Made-to-order pieces, gift cards and final-sale items are excluded where marked on the product page.",
            "Please check the fabric and care notes before washing; a returned piece must be in its original condition.",
          ],
        },
        {
          id: "how",
          title: "How to start",
          body: [
            "Open the order in your account, choose the item and select return or exchange. Add a short reason so the seller knows what to expect.",
            "Requests are recorded for review in this demo; the order status does not change automatically. Keep the parcel ready until instructions arrive.",
          ],
        },
        {
          id: "refunds",
          title: "Refunds and exchanges",
          body: [
            "Refunds are initiated after the returned item is received and checked. Bank processing times vary by payment method.",
            "Exchanges depend on stock. If the replacement is unavailable, we will offer a refund instead.",
          ],
        },
      ]}
    />
  );
}
