"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import type { AdminSettings } from "@/lib/admin-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminSection } from "@/components/admin/admin-ui";
import { toast } from "@/store/toast-store";

type SlabForm = { upTo: string; rate: string };

export function SettingsForm({ settings }: { settings: AdminSettings }) {
  const router = useRouter();
  const [commission, setCommission] = useState(String(settings.defaultCommissionRate));
  const [slabs, setSlabs] = useState<SlabForm[]>(() => settings.gstSlabs.map((slab) => ({ upTo: slab.upToPerPiece === null ? "" : String(slab.upToPerPiece / 100), rate: String(slab.rate) })));
  const [threshold, setThreshold] = useState(String(settings.freeDeliveryThreshold / 100));
  const [shipping, setShipping] = useState(String(settings.standardShippingFee / 100));
  const [returns, setReturns] = useState(String(settings.returnWindowDays));
  const [deliveryMin, setDeliveryMin] = useState(String(settings.deliveryDays.min));
  const [deliveryMax, setDeliveryMax] = useState(String(settings.deliveryDays.max));
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      const payload = {
        defaultCommissionRate: Number(commission),
        gstSlabs: slabs.map((slab) => ({
          upToPerPiece: slab.upTo.trim() === "" ? null : Math.round(Number(slab.upTo) * 100),
          rate: Number(slab.rate),
        })),
        freeDeliveryThreshold: Math.round(Number(threshold) * 100),
        standardShippingFee: Math.round(Number(shipping) * 100),
        returnWindowDays: Number(returns),
        deliveryDays: { min: Number(deliveryMin), max: Number(deliveryMax) },
      };
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not save settings.");
      toast.success("Commerce settings saved", { description: "Cart, checkout and payout figures use the new values." });
      router.refresh();
    } catch (error) {
      toast.error("Could not save settings", { description: error instanceof Error ? error.message : "Please try again." });
    } finally { setBusy(false); }
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-2">
      <AdminSection title="Commission & delivery" description="Values apply to new calculations, not historical orders">
        <div className="space-y-3 p-4">
          <Input label="Default commission (%)" hint="Used for new merchants and seed sellers." type="number" min="0" max="50" step="0.5" value={commission} onChange={(event) => setCommission(event.target.value)} />
          <Input label="Free delivery from (₹)" type="number" min="0" step="1" value={threshold} onChange={(event) => setThreshold(event.target.value)} />
          <Input label="Standard delivery fee (₹)" type="number" min="0" step="1" value={shipping} onChange={(event) => setShipping(event.target.value)} />
          <Input label="Return window (days)" type="number" min="0" max="60" value={returns} onChange={(event) => setReturns(event.target.value)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Delivery days (min)" type="number" min="0" max="30" value={deliveryMin} onChange={(event) => setDeliveryMin(event.target.value)} />
            <Input label="Delivery days (max)" type="number" min="0" max="60" value={deliveryMax} onChange={(event) => setDeliveryMax(event.target.value)} />
          </div>
          <p className="caption">Express delivery is charged at twice the standard fee.</p>
        </div>
      </AdminSection>

      <AdminSection title="GST slabs" description="Inclusive upper price per piece in rupees. Leave the last bound blank for no limit.">
        <div className="space-y-3 p-4">
          {slabs.map((slab, index) => (
            <div key={index} className="grid grid-cols-[1fr_5rem_auto] gap-2">
              <Input aria-label={`Slab ${index + 1} upper price`} type="number" min="1" step="1" placeholder={index === slabs.length - 1 ? "No limit" : "Up to ₹"} value={slab.upTo} onChange={(event) => setSlabs(slabs.map((item, itemIndex) => itemIndex === index ? { ...item, upTo: event.target.value } : item))} />
              <Input aria-label={`Slab ${index + 1} rate`} type="number" min="0" max="50" step="0.5" value={slab.rate} onChange={(event) => setSlabs(slabs.map((item, itemIndex) => itemIndex === index ? { ...item, rate: event.target.value } : item))} />
              <Button variant="quiet" size="sm" aria-label={`Remove slab ${index + 1}`} disabled={slabs.length === 1} onClick={() => setSlabs(slabs.filter((_, itemIndex) => itemIndex !== index))}><Trash2 aria-hidden className="size-4" /></Button>
            </div>
          ))}
          {slabs.length < 5 ? <Button size="sm" variant="ghost" onClick={() => setSlabs([...slabs, { upTo: "", rate: "5" }])}><Plus aria-hidden className="mr-1 size-4" />Add slab</Button> : null}
          <p className="caption">Prices are GST-inclusive. The first matching slab wins; keep them ordered by upper bound.</p>
        </div>
      </AdminSection>

      <div className="xl:col-span-2">
        <Button loading={busy} onClick={save}>Save settings</Button>
      </div>
    </div>
  );
}