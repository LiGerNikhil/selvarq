import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "neutral" | "gold" | "indigo" | "sale" | "success" | "danger" | "outline";

const variants: Record<BadgeVariant, string> = {
  neutral: "bg-pearl text-ink",
  gold: "bg-gold-soft text-indigo-deep",
  indigo: "bg-indigo text-ivory",
  // Burgundy is for sale tags and small highlights only.
  sale: "bg-burgundy text-ivory",
  success: "bg-success/10 text-success",
  danger: "bg-danger/10 text-danger",
  outline: "border border-line text-ink",
};

export interface BadgeProps extends ComponentProps<"span"> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-ui px-2 py-1 text-[11px] font-medium uppercase leading-none tracking-[0.12em]",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
