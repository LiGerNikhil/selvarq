import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function MerchantPendingLoading() {
  return <div className="page-container max-w-3xl space-y-5 py-16"><Skeleton className="h-6 w-40" /><Skeleton className="h-12 w-full max-w-xl" /><SkeletonText lines={2} /><Skeleton className="h-36 w-full" /></div>;
}
