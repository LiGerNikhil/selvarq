"use client";

import { Star } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

/** Pick 1 to 5 stars. A radio group: arrow keys move and select, 44px targets. */
export function RatingInput({
  value,
  onChange,
  label = "Your rating",
  disabled,
  className,
}: RatingInputProps) {
  const [hover, setHover] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const shown = hover || value;

  function move(next: number) {
    const clamped = Math.min(5, Math.max(1, next));
    onChange(clamped);
    refs.current[clamped - 1]?.focus();
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      move((value || 0) + 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      move((value || 2) - 1);
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      onMouseLeave={() => setHover(0)}
      className={cn("inline-flex", className)}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          ref={(el) => {
            refs.current[n - 1] = el;
          }}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
          tabIndex={value === n || (value === 0 && n === 1) ? 0 : -1}
          disabled={disabled}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          className="grid size-11 place-items-center rounded-ui text-gold transition-transform duration-200 hover:scale-110 disabled:opacity-50"
        >
          <Star
            aria-hidden
            className={cn("size-7 transition-colors duration-200", n <= shown ? "fill-current" : "fill-transparent")}
          />
        </button>
      ))}
    </div>
  );
}
