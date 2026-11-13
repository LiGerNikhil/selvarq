"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useToastStore, type ToastItem, type ToastTone } from "@/store/toast-store";

export { toast } from "@/store/toast-store";

const tones: Record<ToastTone, { bar: string; icon: typeof Info; iconClass: string }> = {
  neutral: { bar: "border-l-gold", icon: Info, iconClass: "text-gold" },
  info: { bar: "border-l-indigo", icon: Info, iconClass: "text-indigo" },
  success: { bar: "border-l-success", icon: CircleCheck, iconClass: "text-success" },
  error: { bar: "border-l-danger", icon: CircleAlert, iconClass: "text-danger" },
};

function ToastCard({ item }: { item: ToastItem }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const [paused, setPaused] = useState(false);
  const { bar, icon: Icon, iconClass } = tones[item.tone];

  // Auto-dismiss; hovering or focusing inside pauses and restarts the clock.
  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => dismiss(item.id), item.duration);
    return () => window.clearTimeout(timer);
  }, [paused, item.id, item.duration, dismiss]);

  return (
    <motion.div
      layout
      role={item.tone === "error" ? "alert" : "status"}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-ui border border-l-2 border-line bg-ivory py-3 pl-4 pr-2 shadow-float",
        bar,
      )}
    >
      <Icon aria-hidden className={cn("mt-0.5 size-5 shrink-0", iconClass)} />
      <div className="flex-1 py-0.5">
        <p className="text-sm font-medium text-ink">{item.title}</p>
        {item.description ? <p className="caption">{item.description}</p> : null}
      </div>
      <button
        type="button"
        onClick={() => dismiss(item.id)}
        aria-label="Dismiss notification"
        className="grid size-11 shrink-0 place-items-center rounded-ui text-muted transition-colors duration-200 hover:text-indigo"
      >
        <X aria-hidden className="size-4" />
      </button>
    </motion.div>
  );
}

/** Mount once in the root layout. Sits above the mobile tab bar and safe-area inset. */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <MotionConfig reducedMotion="user">
      <div
        role="region"
        aria-label="Notifications"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 px-4 pb-[calc(env(safe-area-inset-bottom)+5rem)] md:items-end md:pb-6"
      >
        <AnimatePresence initial={false}>
          {toasts.map((item) => (
            <ToastCard key={item.id} item={item} />
          ))}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
