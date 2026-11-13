"use client";

import { X } from "lucide-react";
import { useId, type ReactNode } from "react";
import { useModalDialog } from "@/hooks/use-modal-dialog";

export type SheetSide = "responsive" | "right" | "left" | "bottom";

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  /** Pinned action row, e.g. Apply and Clear. */
  footer?: ReactNode;
  /** "responsive": bottom sheet below 768px, right-hand drawer above. */
  side?: SheetSide;
}

/**
 * Bottom sheet on mobile, side drawer on desktop (native <dialog>).
 * Used for filters, sort, bag preview and menus.
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  side = "responsive",
}: SheetProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialog = useModalDialog(open, onOpenChange);

  return (
    <dialog
      {...dialog}
      className="overlay"
      data-kind="sheet"
      data-side={side}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
    >
      <div className="overlay-panel sheet-panel flex flex-col border-t border-t-gold bg-ivory shadow-float md:border-t-0">
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="flex flex-col gap-1">
            <h2 id={titleId} className="display-md text-indigo">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="caption">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="-mr-2 -mt-1 grid size-11 shrink-0 place-items-center rounded-ui text-indigo transition-colors duration-200 hover:bg-indigo/5"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 text-ink">{children}</div>
        {footer ? (
          <div className="flex gap-3 border-t border-line px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 [&>*]:flex-1">
            {footer}
          </div>
        ) : null}
      </div>
    </dialog>
  );
}
