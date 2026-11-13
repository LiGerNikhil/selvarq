"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  /** Accessible name for the tab list. */
  label: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (id: string) => void;
  className?: string;
}

/** WAI-ARIA tabs with automatic activation. Left/Right/Home/End move between tabs. */
export function Tabs({ items, label, defaultValue, value, onValueChange, className }: TabsProps) {
  const base = useId();
  const [internal, setInternal] = useState(defaultValue ?? items.find((i) => !i.disabled)?.id ?? "");
  const active = value ?? internal;
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  function select(id: string) {
    if (value === undefined) setInternal(id);
    onValueChange?.(id);
    tabRefs.current[id]?.focus();
  }

  function onKeyDown(event: KeyboardEvent) {
    const enabled = items.filter((i) => !i.disabled);
    const index = enabled.findIndex((i) => i.id === active);
    let next: number | null = null;
    if (event.key === "ArrowRight") next = (index + 1) % enabled.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + enabled.length) % enabled.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = enabled.length - 1;
    if (next === null) return;
    event.preventDefault();
    const target = enabled[next];
    if (target) select(target.id);
  }

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="flex gap-6 overflow-x-auto border-b border-line [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => {
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[item.id] = el;
              }}
              id={`${base}-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${base}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              disabled={item.disabled}
              onClick={() => select(item.id)}
              className={cn(
                "relative min-h-11 shrink-0 text-xs font-medium uppercase tracking-[0.14em] transition-colors duration-200 disabled:opacity-40",
                "after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-300",
                selected ? "text-indigo after:scale-x-100" : "text-muted hover:text-indigo",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          id={`${base}-panel-${item.id}`}
          role="tabpanel"
          aria-labelledby={`${base}-tab-${item.id}`}
          hidden={item.id !== active}
          tabIndex={0}
          className="pt-5"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
