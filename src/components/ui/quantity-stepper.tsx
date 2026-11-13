"use client";

import { Minus, Plus } from "lucide-react";
import { COMMERCE } from "@/lib/config";
import { cn } from "@/lib/utils";

export interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  /** Cap this at available stock where known. */
  max?: number;
  disabled?: boolean;
  label?: string;
  className?: string;
}

const stepButton =
  "grid size-11 place-items-center text-indigo transition-colors duration-200 hover:bg-indigo/5 disabled:pointer-events-none disabled:opacity-40";

/** Minus / value / plus. The value is announced politely as it changes. */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = COMMERCE.maxQuantityPerItem,
  disabled = false,
  label = "Quantity",
  className,
}: QuantityStepperProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex items-center rounded-ui border border-line bg-ivory", className)}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={stepButton}
      >
        <Minus aria-hidden className="size-4" />
      </button>
      <output
        aria-live="polite"
        aria-atomic="true"
        className="min-w-10 select-none text-center text-sm font-medium tabular-nums text-ink"
      >
        {value}
      </output>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={stepButton}
      >
        <Plus aria-hidden className="size-4" />
      </button>
    </div>
  );
}
