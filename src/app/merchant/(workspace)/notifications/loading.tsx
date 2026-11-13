import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function MerchantNotificationsLoading() {
  return <div className="space-y-5"><Skeleton className="h-9 w-56" /><SkeletonText lines={8} /></div>;
}
