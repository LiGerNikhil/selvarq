import type { Metadata } from "next";
import { Accordion } from "@/components/ui/accordion";
import { InfoPage } from "@/components/content/info-page";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/lib/seo";
import { faqs } from "@/data";

export const metadata: Metadata = pageMetadata({
  title: "Frequently asked questions",
  description: "Answers about SELVARQ orders, delivery, returns, payments and selling on the marketplace.",
  path: "/faq",
});

const groups = [
  { id: "orders", title: "Orders", description: "Confirmation, changes and order history." },
  { id: "shipping", title: "Shipping", description: "Charges, timelines and address changes." },
  { id: "returns", title: "Returns", description: "How to start a return and what to expect." },
  { id: "payments", title: "Payments", description: "Accepted methods and refunds." },
  { id: "sellers", title: "Selling", description: "How makers join SELVARQ." },
] as const;

export default function FaqPage() {
  return (
    <InfoPage
      eyebrow="Help"
      title="Frequently asked questions"
      intro="Short answers to the questions we hear most. If something is unclear, the contact form is a better place for detail."
      crumbs={[{ label: "Home", href: "/" }, { label: "FAQs" }]}
      sections={groups.map((group) => ({
        id: group.id,
        title: group.title,
        body: [
          <p key="desc">{group.description}</p>,
          <Accordion
            key="accordion"
            items={faqs.filter((faq) => faq.category === group.id).map((faq) => ({ id: faq.id, title: faq.question, content: faq.answer }))}
            headingLevel={3}
          />,
        ],
      }))}
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }}
      />
    </InfoPage>
  );
}
