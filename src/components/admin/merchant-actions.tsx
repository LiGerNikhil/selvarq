"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ShieldCheck, ShieldOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/store/toast-store";
import type { Merchant } from "@/data";

async function patchMerchant(id: string, body: Record<string, unknown>) {
  const response = await fetch(`/api/admin/merchants/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json() as { error?: string };
  if (!response.ok) throw new Error(result.error ?? "Could not update this merchant.");
}

export function MerchantStatusActions({ merchantId, status }: { merchantId: string; status: Merchant["status"] }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  async function update(next: Merchant["status"], rejectionReason?: string) {
    setBusy(next);
    try {
      await patchMerchant(merchantId, { status: next, ...(rejectionReason ? { rejectionReason } : {}) });
      toast.success(`Merchant ${next}`, { description: "The merchant workspace reflects this status immediately." });
      setRejecting(false);
      setReason("");
      router.refresh();
    } catch (error) {
      toast.error("Could not update merchant", { description: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {status !== "approved" ? (
          <Button size="sm" loading={busy === "approved"} onClick={() => update("approved")}>
            <Check aria-hidden className="mr-1 size-4" />Approve
          </Button>
        ) : null}
        {status !== "suspended" ? (
          <Button size="sm" variant="danger" loading={busy === "suspended"} onClick={() => update("suspended")}>
            <ShieldOff aria-hidden className="mr-1 size-4" />Suspend
          </Button>
        ) : null}
        {status !== "approved" && status !== "pending" ? (
          <Button size="sm" variant="ghost" loading={busy === "approved"} onClick={() => update("approved")}>
            <ShieldCheck aria-hidden className="mr-1 size-4" />Reinstate
          </Button>
        ) : null}
        {status !== "rejected" ? (
          <Button size="sm" variant="ghost" onClick={() => setRejecting((current) => !current)}>
            <X aria-hidden className="mr-1 size-4" />Reject
          </Button>
        ) : null}
      </div>
      {rejecting ? (
        <div className="space-y-2 border border-line p-3">
          <Input label="Reason for rejection" hint="Shared with the seller in the demo workspace." value={reason} onChange={(event) => setReason(event.target.value)} />
          <Button size="sm" variant="danger" loading={busy === "rejected"} disabled={reason.trim().length < 5} onClick={() => update("rejected", reason.trim())}>
            Send rejection
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function MerchantCommissionForm({ merchantId, rate }: { merchantId: string; rate: number }) {
  const router = useRouter();
  const [value, setValue] = useState(String(rate));
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      await patchMerchant(merchantId, { commissionRate: Number(value) });
      toast.success("Commission updated", { description: `This merchant now pays ${value}% per order line.` });
      router.refresh();
    } catch (error) {
      toast.error("Could not update commission", { description: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="w-32"><Input label="Rate (%)" type="number" min="0" max="50" step="0.5" value={value} onChange={(event) => setValue(event.target.value)} /></div>
      <Button size="sm" loading={busy} onClick={save}>Save rate</Button>
    </div>
  );
}

export function DocumentVerifyButton({ merchantId, documentId, verified }: { merchantId: string; documentId: string; verified: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      await patchMerchant(merchantId, { documentId, documentVerified: !verified });
      toast.success(verified ? "Document marked unverified" : "Document verified");
      router.refresh();
    } catch (error) {
      toast.error("Could not update document", { description: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button size="sm" variant={verified ? "ghost" : "primary"} loading={busy} onClick={toggle}>
      {verified ? "Mark unverified" : "Verify document"}
    </Button>
  );
}