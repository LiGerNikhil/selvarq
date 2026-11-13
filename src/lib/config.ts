import type { Paise } from "@/types";

export const BRAND = {
  name: "SELVARQ",
  tagline: "Premium Clothing.",
  footerLine: "SELVARQ, a brand of Sharda Garments.",
  legalEntity: "Sharda Garments",
  locale: "en-IN",
  currency: "INR",
} as const;

/** Seller id and display name for the brand's own catalogue. */
export const PLATFORM_SELLER = {
  id: "sharda-garments",
  name: "Sharda Garments",
} as const;

export interface GstSlab {
  /** Inclusive upper bound of the per-piece price, in paise. null = no upper bound. */
  upToPerPiece: Paise | null;
  /** Percent. */
  rate: number;
}

export const COMMERCE = {
  /** Platform commission, percent, per merchant order line. Editable per merchant. */
  defaultCommissionRate: 12,

  /**
   * GST slabs for apparel, ordered ascending. Prices are GST-inclusive.
   * Defaults: 5% up to Rs 2,500 per piece, 18% above. To be confirmed with the CA.
   */
  gstSlabs: [
    { upToPerPiece: 250_000, rate: 5 },
    { upToPerPiece: null, rate: 18 },
  ] satisfies GstSlab[],

  /** Orders at or above this value ship free. */
  freeDeliveryThreshold: 199_900 satisfies Paise,
  /** Placeholder: confirm the real flat fee. */
  standardShippingFee: 9_900 satisfies Paise,
  returnWindowDays: 7,
  /** Placeholder transit window used for delivery estimates. */
  deliveryDays: { min: 3, max: 7 },
  maxQuantityPerItem: 10,
} as const;

/** GST percent for one piece at the given GST-inclusive price. */
export function gstRateFor(
  unitPrice: Paise,
  slabs: readonly GstSlab[] = COMMERCE.gstSlabs,
): number {
  for (const slab of slabs) {
    if (slab.upToPerPiece === null || unitPrice <= slab.upToPerPiece) return slab.rate;
  }
  return slabs[slabs.length - 1]?.rate ?? 0;
}
