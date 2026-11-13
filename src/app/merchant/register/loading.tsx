import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function MerchantRegisterLoading() {
  return <main className="page-container max-w-5xl py-12"><Skeleton className="h-8 w-64" /><SkeletonText lines={4} className="mt-8" /></main>;
}
