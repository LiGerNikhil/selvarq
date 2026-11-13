import { Skeleton, SkeletonCard, SkeletonText } from "@/components/ui/skeleton";

export default function CheckoutLoading() {
  return <main className="page-container py-10"><Skeleton className="mb-8 h-10 w-64" /><div className="grid gap-8 lg:grid-cols-[1.5fr_0.8fr]"><div className="space-y-5"><Skeleton className="h-12 w-full" /><SkeletonText lines={7} /><Skeleton className="h-12 w-40" /></div><SkeletonCard /></div></main>;
}
