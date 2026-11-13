"use client";

import { useCallback, useEffect, useRef, type MouseEvent, type PointerEvent } from "react";

/**
 * Wires a native <dialog> to controlled open state.
 * showModal() gives us focus trapping, Escape to close, inert background and
 * focus return to the trigger. A click counts as "outside" only if it both
 * started and ended on the dialog itself, so text selection that drags out of
 * the panel does not dismiss it.
 */
export function useModalDialog(open: boolean, onOpenChange: (open: boolean) => void) {
  const ref = useRef<HTMLDialogElement>(null);
  const pressedOutside = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const onClose = useCallback(() => onOpenChange(false), [onOpenChange]);

  const onPointerDown = useCallback((event: PointerEvent<HTMLDialogElement>) => {
    pressedOutside.current = event.target === event.currentTarget;
  }, []);

  const onClick = useCallback(
    (event: MouseEvent<HTMLDialogElement>) => {
      if (pressedOutside.current && event.target === event.currentTarget) onOpenChange(false);
      pressedOutside.current = false;
    },
    [onOpenChange],
  );

  return { ref, onClose, onPointerDown, onClick };
}
