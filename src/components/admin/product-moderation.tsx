"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import type { Product } from "@/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MediaImage } from "@/components/ui/media-image";
import { DataTable, type DataColumn } from "@/components/admin/data-table";
import { formatINR } from "@/lib/format";
import { toast } from "@/store/toast-store";

export interface ModerationRow {
  product: Product;
  merchantName: string;
  categoryName: string;
}

export function ProductModerationTable({ rows }: { rows: ModerationRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function bulk(status: "active" | "draft") {
    const ids = [...selected];
    if (!ids.length) return;
    setBusy(true);
    try {
      const response = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, status }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not update products.");
      toast.success(status === "active" ? "Products approved" : "Products returned to draft", { description: `${ids.length} listing${ids.length === 1 ? "" : "s"} updated.` });
      setSelected(new Set());
      router.refresh();
    } catch (error) {
      toast.error("Moderation failed", { description: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setBusy(false);
    }
  }

  async function single(id: string, status: "active" | "draft") {
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not update this product.");
      toast.success(status === "active" ? "Listing approved" : "Listing moved to draft");
      router.refresh();
    } catch (error) {
      toast.error("Moderation failed", { description: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setBusy(false);
    }
  }

  const allSelected = rows.length > 0 && rows.every((row) => selected.has(row.product.id));

  const columns: DataColumn<ModerationRow>[] = [
    {
      key: "select",
      header: "",
      cell: (row) => (
        <input
          type="checkbox"
          aria-label={`Select ${row.product.name}`}
          checked={selected.has(row.product.id)}
          onChange={() => toggle(row.product.id)}
          className="size-4 accent-indigo"
        />
      ),
      className: "w-10",
      mobileHidden: true,
    },
    {
      key: "product",
      header: "Product",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <span className="w-10 shrink-0"><MediaImage src={row.product.imageIds[0] ?? "placeholder:product"} alt="" ratio="4/5" sizes="40px" /></span>
          <div className="min-w-0">
            <p className="truncate font-medium text-indigo">{row.product.name}</p>
            <p className="caption mt-0.5 truncate">{row.merchantName} · {row.categoryName}</p>
          </div>
        </div>
      ),
    },
    { key: "price", header: "Price", cell: (row) => formatINR(row.product.price), className: "whitespace-nowrap" },
    { key: "status", header: "Status", cell: (row) => <Badge variant={row.product.status === "active" ? "success" : "gold"}>{row.product.status}</Badge> },
    {
      key: "actions",
      header: "Decision",
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.product.status === "draft" ? (
            <Button size="sm" disabled={busy} onClick={() => single(row.product.id, "active")}><Check aria-hidden className="mr-1 size-3.5" />Approve</Button>
          ) : (
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => single(row.product.id, "draft")}><X aria-hidden className="mr-1 size-3.5" />Unpublish</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-line bg-pearl p-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={() => setSelected(allSelected ? new Set() : new Set(rows.map((row) => row.product.id)))}
            className="size-4 accent-indigo"
          />
          Select all ({rows.length})
        </label>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={!selected.size || busy} loading={busy} onClick={() => bulk("active")}>Approve selected</Button>
          <Button size="sm" variant="ghost" disabled={!selected.size || busy} onClick={() => bulk("draft")}>Return to draft</Button>
        </div>
      </div>
      <DataTable columns={columns} rows={rows} getRowKey={(row) => row.product.id} caption="Product moderation queue" empty="The moderation queue is clear." />
    </div>
  );
}