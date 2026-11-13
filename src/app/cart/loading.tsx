import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function CartLoading() {
  return <main className="page-container py-10"><Skeleton className="mb-8 h-10 w-48" /><div className="grid gap-8 lg:grid-cols-[1.7fr_0.8fr]"><div className="space-y-5"><SkeletonCard /><SkeletonCard /></div><SkeletonCard /></div></main>;
}
