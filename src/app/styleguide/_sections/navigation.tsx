"use client";

import { Accordion } from "@/components/ui/accordion";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Tabs } from "@/components/ui/tabs";
import { Section, Specimen } from "./section";

const productInfo = [
  {
    id: "fabric",
    title: "Fabric and fit",
    content: <p className="body">100% cotton poplin, 120 GSM. Regular fit, true to size. Model is 6 ft and wears M.</p>,
  },
  {
    id: "care",
    title: "Care",
    content: <p className="body">Machine wash cold with like colours. Dry in shade. Warm iron on reverse.</p>,
  },
  {
    id: "delivery",
    title: "Delivery and returns",
    content: <p className="body">Free delivery above Rs 1,999. Easy 7-day returns, unworn and with tags.</p>,
  },
];

const tabs = [
  { id: "description", label: "Description", content: <p className="body">Cut with intent, finished to last. A shirt for long days and longer evenings.</p> },
  { id: "reviews", label: "Reviews (128)", content: <p className="body">Rated 4.6 out of 5 by verified buyers.</p> },
  { id: "sizing", label: "Size guide", content: <p className="body">Chest 38 in for M. Length 28.5 in.</p> },
  { id: "disabled", label: "Unavailable", disabled: true, content: null },
];

export function NavigationSection() {
  return (
    <Section id="navigation" eyebrow="Wayfinding" title="Tabs, accordion, breadcrumbs">
      <Specimen label="Breadcrumbs" note="Wraps on narrow screens. The last item is the current page.">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Women", href: "/styleguide" },
            { label: "Kurtas", href: "/styleguide" },
            { label: "Chanderi Silk Kurta, Ivory" },
          ]}
        />
      </Specimen>

      <Specimen label="Tabs" note="Arrow keys, Home and End move between tabs. Scrolls sideways inside its own row on narrow screens.">
        <Tabs label="Product details" items={tabs} />
      </Specimen>

      <Specimen label="Accordion, single" note="One panel open at a time.">
        <Accordion items={productInfo} defaultOpen={["fabric"]} />
      </Specimen>

      <Specimen label="Accordion, multiple" note="Any number open.">
        <Accordion items={productInfo} type="multiple" defaultOpen={["fabric", "care"]} />
      </Specimen>
    </Section>
  );
}
