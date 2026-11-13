import { Star } from "lucide-react";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

const starSize = { sm: "size-3.5", md: "size-4", lg: "size-5" } as const;

export interface RatingProps {
  /** 0 to 5; fractions render as partial stars. */
  value: number;
  /** Review count, shown in brackets. */
  count?: number;
  size?: keyof typeof starSize;
  showValue?: boolean;
  className?: string;
}

function Stars({ size, className }: { size: keyof typeof starSize; className: string }) {
  return (
    <span className={cn("flex shrink-0", className)}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} aria-hidden className={cn(starSize[size], "shrink-0 fill-current")} />
      ))}
    </span>
  );
}

/** Read-only star rating. The stars are announced once, as a single image label. */
export function Rating({ value, count, size = "md", showValue = false, className }: RatingProps) {
  const clamped = Math.min(5, Math.max(0, value));
  const label =
    count !== undefined
      ? `Rated ${clamped.toFixed(1)} out of 5, from ${formatNumber(count)} reviews`
      : `Rated ${clamped.toFixed(1)} out of 5`;
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span role="img" aria-label={label} className="relative inline-flex">
        <Stars size={size} className="text-gold-soft" />
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${(clamped / 5) * 100}%` }}
        >
          <Stars size={size} className="text-gold" />
        </span>
      </span>
      {showValue ? (
        <span className="text-sm font-medium text-ink">{clamped.toFixed(1)}</span>
      ) : null}
      {count !== undefined ? <span className="caption">({formatNumber(count)})</span> : null}
    </span>
  );
}
