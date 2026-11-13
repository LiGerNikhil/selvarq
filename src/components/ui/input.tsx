import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { FieldLabel, FieldMessages, controlClass, describedBy, useFieldIds } from "./field";

export interface InputProps extends ComponentProps<"input"> {
  label?: string;
  hint?: string;
  error?: string;
}

/**
 * Text input with label, hint and error. Without a visible label, pass aria-label.
 * Set type, inputMode and autoComplete for the data (e.g. type="email" autoComplete="email").
 */
export function Input({ label, hint, error, className, id, required, ...props }: InputProps) {
  const ids = useFieldIds(id);
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <FieldLabel htmlFor={ids.id} required={required}>
          {label}
        </FieldLabel>
      ) : null}
      <input
        id={ids.id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(ids, Boolean(hint), Boolean(error))}
        className={cn(controlClass, className)}
        {...props}
      />
      <FieldMessages ids={ids} hint={hint} error={error} />
    </div>
  );
}
