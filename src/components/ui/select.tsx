import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { FieldLabel, FieldMessages, controlClass, describedBy, useFieldIds } from "./field";

export interface SelectProps extends ComponentProps<"select"> {
  label?: string;
  hint?: string;
  error?: string;
}

/** Native select: best picker on mobile, fully accessible. Pass <option> children. */
export function Select({
  label,
  hint,
  error,
  className,
  id,
  required,
  children,
  ...props
}: SelectProps) {
  const ids = useFieldIds(id);
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <FieldLabel htmlFor={ids.id} required={required}>
          {label}
        </FieldLabel>
      ) : null}
      <div className="relative">
        <select
          id={ids.id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(ids, Boolean(hint), Boolean(error))}
          className={cn(controlClass, "cursor-pointer appearance-none pr-10", className)}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-indigo"
        />
      </div>
      <FieldMessages ids={ids} hint={hint} error={error} />
    </div>
  );
}
