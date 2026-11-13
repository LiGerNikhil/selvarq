import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Loading placeholder. Give it the size of what it stands in for to avoid layout shift. */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return <div aria-hidden className={cn("animate-pulse rounded-ui bg-line/60", className)} {...props} />;
}

/** A few lines of text; the last line is shorter. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div aria-hidden className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn("h-3.5", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}

/** 4:5 image block with two text lines, matching a product card. */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("flex flex-col gap-3", className)}>
      <Skeleton className="aspect-[4/5] w-full" />
      <Skeleton className="h-3.5 w-3/4" />
      <Skeleton className="h-3.5 w-1/3" />
    </div>
  );
}
