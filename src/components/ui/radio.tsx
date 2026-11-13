import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FieldMessages, useFieldIds } from "./field";

export interface RadioProps extends Omit<ComponentProps<"input">, "type"> {
  label: ReactNode;
  description?: string;
}

export function Radio({ label, description, className, id, ...props }: RadioProps) {
  const ids = useFieldIds(id);
  return (
    <label
      htmlFor={ids.id}
      className={cn(
        "group flex min-h-11 cursor-pointer items-start gap-3 py-2.5 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
        className,
      )}
    >
      <input
        id={ids.id}
        type="radio"
        className="peer sr-only"
        aria-describedby={description ? ids.hintId : undefined}
        {...props}
      />
      <span
        aria-hidden
        className={cn(
          "mt-px grid size-5 shrink-0 place-items-center rounded-full border border-indigo/50 bg-ivory transition-colors duration-200",
          "group-hover:border-indigo peer-checked:border-indigo",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold",
          "peer-checked:[&>span]:scale-100",
        )}
      >
        <span className="size-2.5 scale-0 rounded-full bg-indigo transition-transform duration-200" />
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
  );
}

export interface RadioOption {
  value: string;
  label: ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  legend: string;
  name: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  error?: string;
  className?: string;
}

/** Controlled (value) or uncontrolled (defaultValue). Rendered as a fieldset with a legend. */
export function RadioGroup({
  legend,
  name,
  options,
  value,
  defaultValue,
  onValueChange,
  error,
  className,
}: RadioGroupProps) {
  const errorId = `${useId()}-error`;
  const controlled = value !== undefined;
  return (
    <fieldset
      className={cn("flex flex-col", className)}
      aria-describedby={error ? errorId : undefined}
    >
      <legend className="mb-1 text-sm font-medium text-ink">{legend}</legend>
      {options.map((option) => (
        <Radio
          key={option.value}
          name={name}
          value={option.value}
          label={option.label}
          description={option.description}
          disabled={option.disabled}
          {...(controlled
            ? { checked: value === option.value }
            : { defaultChecked: defaultValue === option.value })}
          onChange={(event) => {
            if (event.currentTarget.checked) onValueChange?.(option.value);
          }}
        />
      ))}
      <FieldMessages ids={{ id: name, hintId: "", errorId }} error={error} />
    </fieldset>
  );
}
