import type { Metadata } from "next";
import { InfoPage } from "@/components/content/info-page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Our story",
  description: "Learn how SELVARQ brings together considered Indian design, honest cloth and skilled makers in one thoughtful marketplace.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="Our story"
      title="Clothing with a little more intent"
      intro="SELVARQ is a premium Indian marketplace for clothing we would happily wear ourselves. We bring Sharda Garments' own catalogue together with independent makers who share our regard for cloth and finishing."
      crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
      updated="November 2026"
      sections={[
        {
          id: "why",
          title: "Why we started",
          body: [
            "Fashion asks for attention, but it rarely asks how a piece was made. We wanted a shop where the answer is easy to find: what the fabric is, how the garment fits, who made it and how to care for it.",
            "Every product page names its seller and states the fabric and fit plainly. That is a small thing, but it changes how you choose.",
          ],
        },
        {
          id: "makers",
          title: "Makers, not mystery",
          body: [
            "Our own label, Sharda Garments, sits alongside approved independent studios. Each merchant is reviewed before a storefront goes live, and every listing is moderated before it is published.",
            "We work with a small number of sellers so that quality stays legible. Scale is not the point; a wardrobe you return to is.",
          ],
        },
        {
          id: "materials",
          title: "Cloth first",
          body: [
            "Handloom cotton, khadi, mul, chanderi, linen and considered blends form the core of the catalogue. We favour breathable fibres and finishes that age honestly over novelty at any cost.",
            "Prices are GST-inclusive, and the breakup is shown at checkout. We would rather explain a price than decorate it.",
          ],
        },
        {
          id: "service",
          title: "How we serve you",
          body: [
            "Orders are tracked from confirmation to delivery, with per-seller shipment details where an order has more than one maker. Eligible pieces can be returned within the stated window.",
            "This is a demonstration marketplace: orders, accounts and payments are simulated. The design decisions, however, are the real thing.",
          ],
        },
      ]}
    />
  );
}
