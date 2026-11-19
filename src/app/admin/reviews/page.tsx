import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AdminPageHeader, AdminSection, StatCard } from "@/components/admin/admin-ui";
import { ReviewModerationTable } from "@/components/admin/review-moderation";
import { getAdminProducts, getAdminReviewStatus, type AdminReviewStatus } from "@/lib/admin-store";
import { reviewsRepository } from "@/lib/repo";

export const metadata: Metadata = { title: "Review moderation" };

const statuses = ["all", "visible", "flagged", "hidden"] as const;

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const filter = statuses.includes((params.status ?? "all") as (typeof statuses)[number]) ? params.status ?? "all" : "all";
  const q = (params.q ?? "").trim().toLowerCase();
  const known = new Map(getAdminProducts().map((product) => [product.id, product.name]));
  const all = (await reviewsRepository.all()).map((review) => ({
    review,
    productName: known.get(review.productId) ?? review.productId,
    status: getAdminReviewStatus(review.id) as AdminReviewStatus,
  }));
  let rows = all.filter((row) => filter === "all" || row.status === filter);
  if (q) {
    rows = rows.filter((row) => `${row.review.title} ${row.review.body} ${row.review.authorName} ${row.productName}`.toLowerCase().includes(q));
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Community"
        title="Reviews"
        description="Hidden reviews are removed from product pages and rating summaries. Flagged entries stay visible for now, ready for a decision."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="All reviews" value={String(all.length)} />
        <StatCard label="Flagged" value={String(all.filter((row) => row.status === "flagged").length)} tone="attention" />
        <StatCard label="Hidden" value={String(all.filter((row) => row.status === "hidden").length)} />
      </div>

      <form method="get" className="mb-4 grid gap-3 border border-line bg-ivory p-4 sm:grid-cols-[minmax(0,1fr)_10rem_auto]">
        <Input name="q" label="Search" placeholder="Review, customer or product" defaultValue={params.q ?? ""} />
        <Select name="status" label="Moderation" defaultValue={filter}>
          {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
        </Select>
        <div className="flex items-end gap-2">
          <Button type="submit">Filter</Button>
          <Link href="/admin/reviews" className="pb-3 text-xs text-muted underline-offset-4 hover:underline">Clear</Link>
        </div>
      </form>

      <AdminSection title="Review queue" description={`${rows.length} of ${all.length} reviews`}>
        <ReviewModerationTable rows={rows.slice(0, 100)} />
      </AdminSection>
      {rows.length > 100 ? <p className="caption mt-3">Showing the first 100 matching reviews. Narrow the filters to see more.</p> : null}
    </>
  );
}