import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function WishlistLoading() {
  return <main className="page-container py-10"><Skeleton className="mb-8 h-10 w-56" /><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <SkeletonCard key={index} />)}</div></main>;
}
