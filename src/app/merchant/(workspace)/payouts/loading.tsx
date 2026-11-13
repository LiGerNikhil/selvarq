import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function MerchantPayoutsLoading() {
  return <div className="space-y-5"><Skeleton className="h-9 w-72" /><div className="grid gap-3 sm:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-24 w-full" />)}</div><SkeletonText lines={8} /></div>;
}
