import { discountPercent, formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Paise } from "@/types";

const sizes = {
  sm: { price: "text-sm", mrp: "text-xs", off: "text-[11px]" },
  md: { price: "text-base", mrp: "text-sm", off: "text-xs" },
  lg: { price: "text-2xl", mrp: "text-base", off: "text-sm" },
} as const;

export interface PriceProps {
  /** GST-inclusive selling price, paise. */
  price: Paise;
  /** GST-inclusive MRP, paise. Struck through when higher than price. */
  mrp?: Paise;
  size?: keyof typeof sizes;
  /** Adds "Inclusive of all taxes" under the price (product page, cart). */
  showTaxNote?: boolean;
  className?: string;
}

/** Storefront price: GST-inclusive, MRP struck through, honest percent off. */
export function Price({ price, mrp, size = "md", showTaxNote = false, className }: PriceProps) {
  const percent = mrp ? discountPercent(mrp, price) : 0;
  const s = sizes[size];
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span className={cn("font-medium text-ink", s.price)}>
        <span className="sr-only">Price </span>
        {formatINR(price)}
      </span>
      {mrp && percent > 0 ? (
        <>
          <s className={cn("text-muted", s.mrp)}>
            <span className="sr-only">MRP </span>
            {formatINR(mrp)}
          </s>
          <span className={cn("font-medium uppercase tracking-[0.1em] text-burgundy", s.off)}>
            {percent}% off
          </span>
        </>
      ) : null}
      {showTaxNote ? <span className="caption basis-full">Inclusive of all taxes</span> : null}
    </div>
  );
}
