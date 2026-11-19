import type { Metadata } from "next";
import { InfoPage } from "@/components/content/info-page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms of use",
  description: "Terms governing use of the SELVARQ demonstration marketplace.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Policy"
      title="Terms of use"
      intro="SELVARQ is a demonstration marketplace. Please read these terms before using the site, especially the notes about simulated transactions."
      crumbs={[{ label: "Home", href: "/" }, { label: "Terms" }]}
      updated="November 2026"
      sections={[
        {
          id: "demo",
          title: "Demonstration only",
          body: [
            "Products, sellers, orders, payments and tracking references are illustrative. No purchase is made, no money changes hands and nogoods are shipped.",
            "Do not enter real payment or identity details. All demo accounts use the shared password shown on the sign-in page.",
          ],
        },
        {
          id: "content",
          title: "Content and imagery",
          body: [
            "Product copy, brand stories and generated placeholder artwork are provided for this demonstration. Images are local placeholders until a media provider is connected.",
            "You may not copy the storefront or its content for a competing commercial site.",
          ],
        },
        {
          id: "accounts",
          title: "Accounts and sellers",
          body: [
            "Keep your demo credentials to yourself. Seller applications are reviewed through the admin studio and can be approved, rejected or suspended.",
            "Merchant and admin areas are role-gated in the demo only; this is not production access control.",
          ],
        },
        {
          id: "availability",
          title: "Availability",
          body: [
            "The site may be unavailable while data is reset or rebuilt. Process-memory data is intentionally ephemeral and is not a record of any transaction.",
          ],
        },
      ]}
    />
  );
}
