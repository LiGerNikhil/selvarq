import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "ghost" | "quiet" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const base =
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-ui font-medium uppercase tracking-[0.12em] transition-[background-color,color,box-shadow,border-color] duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-indigo text-ivory hover:bg-indigo-deep hover:shadow-[inset_0_0_0_1px_var(--gold)] active:bg-indigo-deep",
  ghost:
    "border border-indigo bg-transparent text-indigo hover:border-indigo-deep hover:bg-indigo/5 active:bg-indigo/10",
  quiet:
    "px-0 text-indigo underline-offset-4 decoration-gold hover:underline hover:decoration-1",
  danger: "border border-danger bg-transparent text-danger hover:bg-danger/5 active:bg-danger/10",
};

// Every size keeps a 44px touch target on mobile; "sm" tightens from 768px up.
const sizes: Record<ButtonSize, string> = {
  sm: "min-h-11 px-4 text-[11px] md:min-h-9",
  md: "min-h-11 px-6 text-xs",
  lg: "min-h-12 px-8 text-[13px]",
};

/** Class string for anything that should look like a button (links, labels). */
export function buttonStyles({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: ButtonStyleProps & { className?: string } = {}): string {
  return cn(base, variants[variant], variant === "quiet" ? "min-h-11" : sizes[size], fullWidth && "w-full", className);
}

export interface ButtonProps extends ComponentProps<"button">, ButtonStyleProps {
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Button({
  variant,
  size,
  fullWidth,
  loading = false,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, size, fullWidth, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <LoaderCircle aria-hidden className="size-4 animate-spin" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!loading && rightIcon}
    </button>
  );
}

export interface ButtonLinkProps
  extends Omit<ComponentProps<typeof Link>, "className">,
    ButtonStyleProps {
  className?: string;
}

/** A next/link that looks like a button. */
export function ButtonLink({ variant, size, fullWidth, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonStyles({ variant, size, fullWidth, className })} {...props} />;
}
