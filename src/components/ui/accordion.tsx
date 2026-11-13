"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** "single" closes the others when one opens. */
  type?: "single" | "multiple";
  defaultOpen?: string[];
  /** Heading level for item titles, to fit the page outline. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

export function Accordion({
  items,
  type = "single",
  defaultOpen = [],
  headingLevel = 3,
  className,
}: AccordionProps) {
  const base = useId();
  const [open, setOpen] = useState<string[]>(defaultOpen);
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";

  function toggle(id: string) {
    setOpen((current) => {
      if (current.includes(id)) return current.filter((x) => x !== id);
      return type === "single" ? [id] : [...current, id];
    });
  }

  return (
    <div className={cn("border-t border-line", className)}>
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        return (
          <div key={item.id} className="border-b border-line">
            <Heading className="font-sans text-base font-normal leading-normal">
              <button
                type="button"
                id={`${base}-btn-${item.id}`}
                aria-expanded={isOpen}
                aria-controls={`${base}-panel-${item.id}`}
                onClick={() => toggle(item.id)}
                className="flex min-h-14 w-full items-center justify-between gap-4 py-3 text-left text-sm font-medium uppercase tracking-[0.12em] text-indigo"
              >
                {item.title}
                <ChevronDown
                  aria-hidden
                  className={cn(
                    "size-4 shrink-0 text-gold transition-transform duration-300 ease-out",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
            </Heading>
            <div
              id={`${base}-panel-${item.id}`}
              role="region"
              aria-labelledby={`${base}-btn-${item.id}`}
              inert={!isOpen}
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <div className="pb-5 text-ink">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
