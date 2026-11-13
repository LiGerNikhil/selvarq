import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function MerchantDashboardLoading() {
  return <div className="space-y-7"><Skeleton className="h-9 w-64" /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-24 w-full" />)}</div><div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]"><Skeleton className="h-72 w-full" /><Skeleton className="h-72 w-full" /></div><div className="grid gap-5 lg:grid-cols-2"><SkeletonText lines={6} /><SkeletonText lines={6} /></div></div>;
}
