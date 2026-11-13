"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import type { MerchantNotification } from "@/lib/demo-merchant-store";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";

export function MerchantNotifications({ notifications }: { notifications: MerchantNotification[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function markAllRead() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/merchant/notifications", { method: "PATCH" });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not update notifications.");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update notifications.");
    } finally { setBusy(false); }
  }

  const unread = notifications.some((item) => !item.read);
  return <section className="mt-6">
    <div className="flex justify-end"><Button size="sm" variant="ghost" disabled={!unread || busy} onClick={markAllRead}><CheckCheck aria-hidden className="mr-2 size-4" />Mark all as read</Button></div>
    {error ? <p role="alert" className="mt-3 text-sm text-danger">{error}</p> : null}
    {notifications.length ? <ul className="mt-3 divide-y divide-line border-y border-line">{notifications.map((item) => <li key={item.id} className="flex gap-3 py-4"><Bell aria-hidden className={`mt-1 size-4 shrink-0 ${item.read ? "text-muted" : "text-gold-ink"}`} /><div><p className="text-sm font-medium">{item.title}</p><p className="body mt-1">{item.description}</p><p className="caption mt-2">{formatDateTime(item.createdAt)}{item.read ? " · Read" : " · New"}</p></div></li>)}</ul> : <p className="body mt-3 border border-dashed border-line p-8 text-center">New orders and fulfilment updates will appear here.</p>}
  </section>;
}
