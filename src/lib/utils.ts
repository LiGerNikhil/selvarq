import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/** Teaches tailwind-merge about the custom typography utilities in globals.css. */
const twMerge = extendTailwindMerge<"type-style">({
  extend: {
    classGroups: {
      "type-style": ["display-xl", "display-lg", "display-md", "eyebrow", "body", "caption"],
    },
  },
});

/** Conditional class names with Tailwind conflict resolution. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
