import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function SellLoading() {
  return <div className="page-container space-y-8 py-16"><Skeleton className="h-12 w-2/3 max-w-xl" /><SkeletonText lines={3} className="max-w-2xl" /><div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-40 w-full" />)}</div></div>;
}
