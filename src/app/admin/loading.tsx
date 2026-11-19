import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <main aria-busy="true" aria-label="Loading admin" className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-64 max-w-full" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-24" />)}
      </div>
      <Skeleton className="h-80 w-full" />
    </main>
  );
}
