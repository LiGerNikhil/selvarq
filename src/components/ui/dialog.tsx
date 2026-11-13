"use client";

import { X } from "lucide-react";
import { useId, type ReactNode } from "react";
import { useModalDialog } from "@/hooks/use-modal-dialog";
import { cn } from "@/lib/utils";

const widths = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-xl" } as const;

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  /** Action row, usually Buttons. */
  footer?: ReactNode;
  size?: keyof typeof widths;
}

/** Centred modal built on native <dialog>. Escape and outside click close it. */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialog = useModalDialog(open, onOpenChange);

  return (
    <dialog
      {...dialog}
      className="overlay"
      data-kind="dialog"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
    >
      <div
        className={cn(
          "overlay-panel flex max-h-[calc(100dvh-2rem)] w-full flex-col rounded-ui border border-line border-t-gold bg-ivory shadow-float",
          widths[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-5 md:px-6">
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
        {children ? (
          <div className="overflow-y-auto overscroll-contain px-5 pb-4 text-ink md:px-6">{children}</div>
        ) : null}
        {footer ? (
          <div className="flex flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end md:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </dialog>
  );
}
