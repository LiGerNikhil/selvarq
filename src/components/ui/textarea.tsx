import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { FieldLabel, FieldMessages, controlClass, describedBy, useFieldIds } from "./field";

export interface TextareaProps extends ComponentProps<"textarea"> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Textarea({
  label,
  hint,
  error,
  className,
  id,
  required,
  rows = 4,
  ...props
}: TextareaProps) {
  const ids = useFieldIds(id);
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <FieldLabel htmlFor={ids.id} required={required}>
          {label}
        </FieldLabel>
      ) : null}
      <textarea
        id={ids.id}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(ids, Boolean(hint), Boolean(error))}
        className={cn(controlClass, "min-h-24 resize-y", className)}
        {...props}
      />
      <FieldMessages ids={ids} hint={hint} error={error} />
    </div>
  );
}
