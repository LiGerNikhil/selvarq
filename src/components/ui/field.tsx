import { useId, type ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shared look for text-like controls (input, textarea, select). */
export const controlClass = cn(
  "block w-full min-h-11 rounded-ui border border-line bg-ivory px-3.5 py-2.5 text-base text-ink",
  "placeholder:text-muted transition-[border-color,box-shadow] duration-200 ease-out",
  "hover:border-indigo/40 focus-visible:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40",
  "disabled:cursor-not-allowed disabled:bg-pearl disabled:text-muted",
  "aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger/30",
);

export interface FieldIds {
  id: string;
  hintId: string;
  errorId: string;
}

export function useFieldIds(id?: string): FieldIds {
  const generated = useId();
  const base = id ?? generated;
  return { id: base, hintId: `${base}-hint`, errorId: `${base}-error` };
}

/** aria-describedby value for whichever messages are showing. */
export function describedBy(ids: FieldIds, hasHint: boolean, hasError: boolean): string | undefined {
  const parts = [hasError ? ids.errorId : null, hasHint ? ids.hintId : null].filter(Boolean);
  return parts.length ? parts.join(" ") : undefined;
}

export function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
      {children}
      {required ? (
        <span aria-hidden className="ml-0.5 text-burgundy">
          *
        </span>
      ) : null}
    </label>
  );
}

export function FieldMessages({
  ids,
  hint,
  error,
}: {
  ids: FieldIds;
  hint?: string;
  error?: string;
}) {
  return (
    <>
      {error ? (
        <p id={ids.errorId} className="flex items-start gap-1.5 text-sm text-danger">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}
      {hint ? (
        <p id={ids.hintId} className={cn("caption", error && "sr-only")}>
          {hint}
        </p>
      ) : null}
    </>
  );
}
