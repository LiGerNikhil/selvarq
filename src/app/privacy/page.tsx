import type { Metadata } from "next";
import { InfoPage } from "@/components/content/info-page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy policy",
  description: "What SELVARQ collects in this demo, why it is collected and how long it is kept.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Policy"
      title="Privacy policy"
      intro="This page describes the data handled by the SELVARQ demonstration storefront. It is a plain-language summary, not legal advice."
      crumbs={[{ label: "Home", href: "/" }, { label: "Privacy" }]}
      updated="November 2026"
      sections={[
        {
          id: "collect",
          title: "What we collect",
          body: [
            "Account details you enter (name, email, phone, addresses and preferences), order and coupon information, product reviews, seller application details and the items you save in your bag or wishlist.",
            "Payment fields are used only to simulate a checkout outcome. Card and UPI values are never stored.",
          ],
        },
        {
          id: "why",
          title: "Why we use it",
          body: [
            "To create and track demo orders, remember your preferences, show relevant products and let sellers manage their listings and payouts.",
            "We do not sell personal information and we do not send marketing email from this demo.",
          ],
        },
        {
          id: "storage",
          title: "Where it lives",
          body: [
            "Accounts, orders, applications and admin settings live in the server process and reset when it restarts. Bag, wishlist and recently viewed items live in your browser storage.",
            "The session cookie is unsigned and exists only to demonstrate role-based flows. Do not use real credentials here.",
          ],
        },
        {
          id: "choices",
          title: "Your choices",
          body: [
            "You can edit profile details, addresses and notification choices in your account. Clearing browser storage removes local bag and wishlist data.",
            "For questions about this demo, use the contact page.",
          ],
        },
      ]}
    />
  );
}
