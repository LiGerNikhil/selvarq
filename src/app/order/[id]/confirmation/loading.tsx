import { Skeleton, SkeletonCard, SkeletonText } from "@/components/ui/skeleton";

export default function OrderConfirmationLoading() {
  return <main className="page-container py-12"><div className="mx-auto max-w-3xl text-center"><Skeleton className="mx-auto size-16 rounded-full" /><Skeleton className="mx-auto mt-6 h-10 w-72" /><SkeletonText lines={2} /></div><div className="mx-auto mt-10 grid max-w-4xl gap-6 lg:grid-cols-2"><SkeletonCard /><SkeletonCard /></div></main>;
}
