import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <main className="page-container py-8 md:py-12">
      <Skeleton className="mb-7 h-5 w-56" />
      <div className="grid gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-[4/5] w-full" />
        <div className="space-y-6 py-2">
          <SkeletonText lines={5} />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <SkeletonText lines={4} />
        </div>
      </div>
    </main>
  );
}
