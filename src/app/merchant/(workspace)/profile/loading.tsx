import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function MerchantProfileLoading() {
  return <div className="space-y-5"><Skeleton className="h-9 w-64" /><div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]"><div className="space-y-4 border border-line p-5"><SkeletonText lines={6} /><Skeleton className="h-11 w-40" /></div><Skeleton className="h-72 w-full" /></div></div>;
}
