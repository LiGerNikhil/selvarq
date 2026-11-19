import type { Metadata } from "next";
import { InfoPage } from "@/components/content/info-page";
import { pageMetadata } from "@/lib/seo";
import { getAdminSettings } from "@/lib/admin-store";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = pageMetadata({
  title: "Shipping & delivery",
  description: "Delivery windows, charges and tracking information for SELVARQ orders across India.",
  path: "/shipping",
});

// Charges come from the live admin settings, so render per request rather than
// freezing build-time values into the page.
export const dynamic = "force-dynamic";

export default function ShippingPage() {
  const settings = getAdminSettings();
  const free = formatINR(settings.freeDeliveryThreshold);
  const fee = formatINR(settings.standardShippingFee);
  return (
    <InfoPage
      eyebrow="Delivery"
      title="Shipping & delivery"
      intro={`We deliver across India. Standard delivery is ${settings.deliveryDays.min} to ${settings.deliveryDays.max} business days, and express is available at checkout where shown.`}
      crumbs={[{ label: "Home", href: "/" }, { label: "Shipping" }]}
      updated="November 2026"
      sections={[
        {
          id: "charges",
          title: "Delivery charges",
          body: [
            `Complimentary standard delivery applies to orders of ${free} or more after discounts. Below that, standard delivery is ${fee}.`,
            `Express delivery, where offered, is charged at twice the standard fee. The exact amount is shown before you pay.`,
          ],
        },
        {
          id: "timelines",
          title: "Timelines",
          body: [
            `Most orders arrive in ${settings.deliveryDays.min} to ${settings.deliveryDays.max} business days after confirmation. Remote locations may take longer.`,
            "An order with several sellers may arrive in more than one parcel. Each parcel gets its own fulfilment status and tracking reference.",
          ],
        },
        {
          id: "tracking",
          title: "Tracking your order",
          body: [
            "Signed-in customers can follow each seller line in the account order view. You can also use the Track order page with your order number and checkout email.",
            "Tracking references are mock values in this demo and are not valid with a courier.",
          ],
        },
      ]}
    />
  );
}
