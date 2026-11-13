import { Check } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FieldMessages, describedBy, useFieldIds } from "./field";

export interface CheckboxProps extends Omit<ComponentProps<"input">, "type"> {
  label: ReactNode;
  description?: string;
  error?: string;
}

/** The native input stays focusable (visually hidden); the box mirrors its state. */
export function Checkbox({ label, description, error, className, id, ...props }: CheckboxProps) {
  const ids = useFieldIds(id);
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label
        htmlFor={ids.id}
        className="group flex min-h-11 cursor-pointer items-start gap-3 py-2.5 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50"
      >
        <input
          id={ids.id}
          type="checkbox"
          className="peer sr-only"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(ids, Boolean(description), Boolean(error))}
          {...props}
        />
        <span
          aria-hidden
          className={cn(
            "mt-px grid size-5 shrink-0 place-items-center rounded-[2px] border border-indigo/50 bg-ivory text-ivory transition-colors duration-200",
            "group-hover:border-indigo peer-checked:border-indigo peer-checked:bg-indigo",
            "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold",
            "peer-aria-[invalid=true]:border-danger peer-checked:[&>svg]:opacity-100",
          )}
        >
          <Check className="size-3.5 opacity-0 transition-opacity duration-200" strokeWidth={3} />
        </span>
        <span className="flex flex-col">
          <span className="text-sm text-ink">{label}</span>
          {description ? (
            <span id={ids.hintId} className="caption">
              {description}
            </span>
          ) : null}
        </span>
      </label>
      <FieldMessages ids={ids} error={error} />
    </div>
  );
}
