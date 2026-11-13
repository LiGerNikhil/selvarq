import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function StyleguideLoading() {
  return (
    <main aria-busy="true" aria-label="Loading style guide" className="page-container flex flex-col gap-8 py-12">
      <Skeleton className="h-12 w-1/2 max-w-sm" />
      <SkeletonText lines={2} className="max-w-xl" />
      <Skeleton className="h-40 w-full" />
    </main>
  );
}
