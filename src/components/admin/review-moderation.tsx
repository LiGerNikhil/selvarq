"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, EyeOff, Flag } from "lucide-react";
import type { Review } from "@/data";
import type { AdminReviewStatus } from "@/lib/admin-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataColumn } from "@/components/admin/data-table";
import { Rating } from "@/components/ui/rating";
import { formatDate } from "@/lib/format";
import { toast } from "@/store/toast-store";

export interface ReviewRow {
  review: Review;
  productName: string;
  status: AdminReviewStatus;
}

const variants: Record<AdminReviewStatus, "success" | "danger" | "gold"> = {
  visible: "success",
  hidden: "danger",
  flagged: "gold",
};

export function ReviewModerationTable({ rows }: { rows: ReviewRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");

  async function update(review: Review, status: AdminReviewStatus) {
    setBusy(review.id);
    try {
      const response = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not update this review.");
      toast.success("Review updated", { description: `${review.title} · ${status}` });
      router.refresh();
    } catch (error) {
      toast.error("Could not update review", { description: error instanceof Error ? error.message : "Please try again." });
    } finally { setBusy(""); }
  }

  const columns: DataColumn<ReviewRow>[] = [
    {
      key: "review",
      header: "Review",
      cell: (row) => (
        <div>
          <p className="font-medium text-indigo">{row.review.title}</p>
          <p className="caption mt-0.5 line-clamp-2">{row.review.body}</p>
        </div>
      ),
    },
    { key: "product", header: "Product", cell: (row) => row.productName },
    { key: "author", header: "Customer", cell: (row) => <span>{row.review.authorName}{row.review.verifiedPurchase ? <span className="caption block">Verified</span> : null}</span> },
    { key: "rating", header: "Rating", cell: (row) => <Rating value={row.review.rating} size="sm" showValue={false} />, className: "whitespace-nowrap" },
    { key: "date", header: "Date", cell: (row) => formatDate(row.review.createdAt), className: "whitespace-nowrap" },
    { key: "status", header: "Status", cell: (row) => <Badge variant={variants[row.status]}>{row.status}</Badge> },
    {
      key: "actions",
      header: "Decision",
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.status !== "visible" ? <Button size="sm" disabled={Boolean(busy)} loading={busy === row.review.id} onClick={() => update(row.review, "visible")}><Check aria-hidden className="mr-1 size-3.5" />Show</Button> : null}
          {row.status !== "flagged" ? <Button size="sm" variant="ghost" disabled={Boolean(busy)} onClick={() => update(row.review, "flagged")}><Flag aria-hidden className="mr-1 size-3.5" />Flag</Button> : null}
          {row.status !== "hidden" ? <Button size="sm" variant="ghost" disabled={Boolean(busy)} onClick={() => update(row.review, "hidden")}><EyeOff aria-hidden className="mr-1 size-3.5" />Hide</Button> : null}
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} rows={rows} getRowKey={(row) => row.review.id} caption="Reviews" empty="No reviews match this filter." />;
}