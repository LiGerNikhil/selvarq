import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function MerchantProductsLoading() {
  return <div className="space-y-5"><Skeleton className="h-8 w-56" /><SkeletonText lines={5} /></div>;
}
