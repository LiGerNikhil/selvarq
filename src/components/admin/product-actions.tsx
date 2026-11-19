"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/store/toast-store";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!window.confirm(`Delete “${name}”? This removes it from the demo catalogue.`)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not delete this product.");
      toast.success("Product deleted", { description: name });
      router.refresh();
    } catch (error) {
      toast.error("Could not delete product", { description: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button size="sm" variant="quiet" loading={busy} onClick={remove} aria-label={`Delete ${name}`}>
      <Trash2 aria-hidden className="size-4" />
    </Button>
  );
}