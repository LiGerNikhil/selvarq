import type { Metadata } from "next";
import { InfoPage } from "@/components/content/info-page";
import { TrackOrderForm } from "@/components/content/track-order-form";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Track an order",
  description: "Check the status of a SELVARQ order with its order number and checkout email.",
  path: "/track",
});

export default function TrackOrderPage() {
  return (
    <InfoPage
      eyebrow="Help"
      title="Track an order"
      intro="Enter your order number and the email used at checkout to see a short status summary. Signed-in customers get fuller detail in their account."
      crumbs={[{ label: "Home", href: "/" }, { label: "Track order" }]}
      sections={[{ id: "help", title: "Where to find your number", body: ["The order number appears in your confirmation view and in the account order list. It looks like SVQ-25-10021."] }]}
    >
      <div className="mt-8"><TrackOrderForm /></div>
    </InfoPage>
  );
}
