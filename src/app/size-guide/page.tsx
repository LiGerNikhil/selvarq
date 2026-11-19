import type { Metadata } from "next";
import { InfoPage } from "@/components/content/info-page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Size guide",
  description: "Body measurements and fit notes for SELVARQ clothing in sizes XS to XXL.",
  path: "/size-guide",
});

const sizes = [
  ["XS", "32", "81", "26", "66", "35", "89"],
  ["S", "34", "86", "28", "71", "37", "94"],
  ["M", "36", "91", "30", "76", "39", "99"],
  ["L", "38", "97", "32", "81", "41", "104"],
  ["XL", "40", "102", "34", "86", "43", "109"],
  ["XXL", "42", "107", "36", "91", "45", "114"],
];

export default function SizeGuidePage() {
  return (
    <InfoPage
      eyebrow="Fit"
      title="Size guide"
      intro="Measurements are body measurements in centimetres and inches. Garments include ease for the stated fit, so a relaxed style will measure larger than the body."
      crumbs={[{ label: "Home", href: "/" }, { label: "Size guide" }]}
      sections={[
        {
          id: "measure",
          title: "How to measure",
          body: [
            "Chest: measure around the fullest part, keeping the tape level. Waist: measure at the natural waistline. Hip: measure around the fullest part of the hips.",
            "If you are between sizes, choose based on the fit note on the product page: relaxed styles can be sized down, tailored styles usually cannot.",
          ],
        },
        {
          id: "chart",
          title: "Body measurements",
          body: [
            <div key="chart" className="overflow-x-auto border border-line">
              <table className="w-full min-w-[34rem] text-left text-sm">
                <caption className="sr-only">Body measurements by size</caption>
                <thead className="bg-pearl text-xs uppercase tracking-[0.1em] text-muted">
                  <tr><th scope="col" className="p-3">Size</th><th scope="col" className="p-3">Chest (in)</th><th scope="col" className="p-3">Chest (cm)</th><th scope="col" className="p-3">Waist (in)</th><th scope="col" className="p-3">Waist (cm)</th><th scope="col" className="p-3">Hip (in)</th><th scope="col" className="p-3">Hip (cm)</th></tr>
                </thead>
                <tbody>
                  {sizes.map((size) => (
                    <tr key={size[0]} className="border-t border-line">
                      {size.map((value, index) => <td key={index} className={index === 0 ? "p-3 font-medium text-indigo" : "p-3"}>{value}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>,
            "Sizes are indicative. Natural fibres such as cotton and linen can relax slightly with wear and washing.",
          ],
        },
        {
          id: "fit",
          title: "Fit notes",
          body: [
            "Close: sits near the body. Regular: room for movement without looking loose. Relaxed: deliberately generous. Tailored: shaped through the body; size up if you prefer layering.",
          ],
        },
      ]}
    />
  );
}
