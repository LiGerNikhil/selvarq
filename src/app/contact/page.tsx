import type { Metadata } from "next";
import { InfoPage } from "@/components/content/info-page";
import { ContactForm } from "@/components/content/contact-form";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact us",
  description: "Questions about an order, a product or becoming a seller? Write to the SELVARQ team and we will point you in the right direction.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <InfoPage
      eyebrow="Get in touch"
      title="Write to us"
      intro="Tell us what you need and we will help as quickly as we can. For order-specific questions, include your order number."
      crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      sections={[
        { id: "orders", title: "Orders and deliveries", body: ["Use the order number and the email placed at checkout. Our demo can look up tracking details on the Track order page."] },
        { id: "sellers", title: "Selling on SELVARQ", body: ["Read the seller proposition first. The application form collects business details, bank information and supporting documents for review."] },
        { id: "response", title: "Response times", body: ["This is a demonstration storefront. Messages are validated in the browser and acknowledged, but no email is sent and nothing is stored."] },
      ]}
    >
      <div className="mt-8 max-w-2xl"><ContactForm /></div>
    </InfoPage>
  );
}
