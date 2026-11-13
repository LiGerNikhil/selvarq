"use client";

import { useState } from "react";
import { Logo } from "@/components/ui/logo";
import { MediaImage } from "@/components/ui/media-image";
import { Price } from "@/components/ui/price";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { Section, Specimen } from "./section";

export function CommerceSection() {
  const [qty, setQty] = useState(2);

  return (
    <Section id="commerce" eyebrow="Storefront" title="Price, quantity, logo, imagery">
      <Specimen label="Price" note="GST-inclusive. MRP struck through only when there is a real saving.">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Price price={129900} />
          <Price price={129900} mrp={159900} />
          <Price price={219950} mrp={299900} size="lg" showTaxNote />
          <Price price={89900} mrp={89900} size="sm" />
        </div>
      </Specimen>

      <Specimen label="Quantity stepper" note={`Value ${qty}. Min 1, max 10; buttons disable at the limits.`}>
        <div className="flex flex-wrap items-center gap-4">
          <QuantityStepper value={qty} onChange={setQty} />
          <QuantityStepper value={1} onChange={() => undefined} disabled label="Quantity (disabled)" />
          <QuantityStepper value={3} onChange={() => undefined} max={3} label="Quantity (at maximum)" />
        </div>
      </Specimen>

      <Specimen label="Logo" note="Text wordmark until public/brand/logo.png and monogram.png exist; then the images are used automatically.">
        <div className="flex flex-wrap items-end gap-8">
          <Logo size="sm" />
          <Logo size="md" />
          <Logo size="lg" />
          <Logo variant="monogram" size="md" />
          <div className="flex items-end gap-8 bg-indigo-deep p-6">
            <Logo tone="ivory" />
            <Logo variant="monogram" tone="ivory" />
          </div>
        </div>
      </Specimen>

      <Specimen label="MediaImage" note="4:5 default. Generated placeholders in mock data; the last tile shows the fallback for a broken image.">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <MediaImage src="placeholder:linen-camp-shirt" alt="Linen camp shirt" sizes="(min-width: 768px) 25vw, 50vw" />
          <MediaImage src="placeholder:chanderi-kurta" alt="Chanderi silk kurta" sizes="(min-width: 768px) 25vw, 50vw" />
          <MediaImage src="placeholder:wool-blend-jacket" alt="Wool blend jacket" sizes="(min-width: 768px) 25vw, 50vw" />
          <MediaImage src="/media/does-not-exist.jpg" alt="Missing image" sizes="(min-width: 768px) 25vw, 50vw" />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <MediaImage src="placeholder:editorial-wide" alt="Editorial banner" ratio="16/9" sizes="(min-width: 768px) 50vw, 100vw" />
          <MediaImage src="placeholder:square-detail" alt="Fabric detail" ratio="1/1" sizes="(min-width: 768px) 50vw, 100vw" />
        </div>
      </Specimen>
    </Section>
  );
}
