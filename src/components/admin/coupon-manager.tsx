"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import type { Coupon } from "@/data";
import type { AdminMerchant } from "@/lib/admin-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AdminSection } from "@/components/admin/admin-ui";
import { toast } from "@/store/toast-store";
import { formatDate, formatINR } from "@/lib/format";

type CouponForm = {
  id?: string;
  code: string;
  description: string;
  discountType: Coupon["discountType"];
  discountValue: string;
  minimumSpend: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
  maxDiscount: string;
  merchantId: string;
};

const emptyCoupon: CouponForm = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: "10",
  minimumSpend: "1500",
  startsAt: new Date().toISOString().slice(0, 10),
  endsAt: new Date(Date.now() + 365 * 86_400_000).toISOString().slice(0, 10),
  active: true,
  maxDiscount: "",
  merchantId: "",
};

function toForm(coupon: Coupon): CouponForm {
  return {
    id: coupon.id,
    code: coupon.code,
    description: coupon.description,
    discountType: coupon.discountType,
    discountValue: coupon.discountType === "fixed" ? String(coupon.discountValue / 100) : String(coupon.discountValue),
    minimumSpend: String(coupon.minimumSpend / 100),
    startsAt: coupon.startsAt.slice(0, 10),
    endsAt: coupon.endsAt.slice(0, 10),
    active: coupon.active,
    maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount / 100) : "",
    merchantId: coupon.merchantId ?? "",
  };
}

export function CouponManager({ coupons, merchants }: { coupons: Coupon[]; merchants: AdminMerchant[] }) {
  const router = useRouter();
  const [form, setForm] = useState<CouponForm>(emptyCoupon);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      const payload = {
        ...(form.id ? { id: form.id } : {}),
        code: form.code,
        description: form.description,
        discountType: form.discountType,
        discountValue: Math.round(Number(form.discountValue) * 100),
        minimumSpend: Math.round(Number(form.minimumSpend) * 100),
        startsAt: `${form.startsAt.slice(0, 10)}T00:00:00.000Z`,
        endsAt: `${form.endsAt.slice(0, 10)}T23:59:59.000Z`,
        active: form.active,
        ...(form.maxDiscount ? { maxDiscount: Math.round(Number(form.maxDiscount) * 100) } : {}),
        ...(form.merchantId ? { merchantId: form.merchantId } : {}),
      };
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not save this coupon.");
      toast.success(form.id ? "Coupon updated" : "Coupon created", { description: form.code.toUpperCase() });
      setForm(emptyCoupon);
      router.refresh();
    } catch (error) {
      toast.error("Could not save coupon", { description: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setBusy(false);
    }
  }

  async function remove(coupon: Coupon) {
    if (!window.confirm(`Delete coupon “${coupon.code}”?`)) return;
    try {
      const response = await fetch("/api/admin/coupons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: coupon.id }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not delete this coupon.");
      toast.success("Coupon deleted", { description: coupon.code });
      if (form.id === coupon.id) setForm(emptyCoupon);
      router.refresh();
    } catch (error) {
      toast.error("Could not delete coupon", { description: error instanceof Error ? error.message : "Please try again." });
    }
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(20rem,1fr)]">
      <AdminSection title="All coupons" description={`${coupons.length} codes · deleted codes stop working at checkout immediately`}>
        <div className="divide-y divide-line">
          {coupons.map((coupon) => {
            const merchant = merchants.find((item) => item.id === coupon.merchantId);
            return (
              <div key={coupon.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-sm font-medium text-indigo">{coupon.code}</p>
                    <Badge variant={coupon.active ? "success" : "outline"}>{coupon.active ? "Active" : "Paused"}</Badge>
                    {merchant ? <Badge variant="gold">{merchant.name}</Badge> : null}
                  </div>
                  <p className="caption mt-1">{coupon.description}</p>
                  <p className="caption mt-1">
                    {coupon.discountType === "percentage" ? `${coupon.discountValue}% off` : `${formatINR(coupon.discountValue)} off`}
                    {" · "}min {formatINR(coupon.minimumSpend)}
                    {" · "}{formatDate(coupon.startsAt)} to {formatDate(coupon.endsAt)}
                    {coupon.maxDiscount ? ` · cap ${formatINR(coupon.maxDiscount)}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button size="sm" variant="quiet" aria-label={`Edit ${coupon.code}`} onClick={() => setForm(toForm(coupon))}><Pencil aria-hidden className="size-4" /></Button>
                  <Button size="sm" variant="quiet" aria-label={`Delete ${coupon.code}`} onClick={() => remove(coupon)}><Trash2 aria-hidden className="size-4" /></Button>
                </div>
              </div>
            );
          })}
        </div>
      </AdminSection>

      <AdminSection title={form.id ? "Edit coupon" : "New coupon"} description="Coupon values are validated by the checkout API">
        <div className="space-y-3 p-4">
          <Input label="Code" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} placeholder="WELCOME10" />
          <Textarea label="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={2} />
          <Select label="Discount type" value={form.discountType} onChange={(event) => setForm({ ...form, discountType: event.target.value as Coupon["discountType"] })}>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed amount</option>
          </Select>
          <Input
            label={form.discountType === "percentage" ? "Discount (%)" : "Discount (₹)"}
            type="number"
            min="1"
            step={form.discountType === "percentage" ? "1" : "0.01"}
            value={form.discountValue}
            onChange={(event) => setForm({ ...form, discountValue: event.target.value })}
          />
          <Input label="Minimum spend (₹)" type="number" min="0" step="1" value={form.minimumSpend} onChange={(event) => setForm({ ...form, minimumSpend: event.target.value })} />
          <Input label="Maximum discount (₹)" hint="Optional cap for percentage codes." type="number" min="1" step="1" value={form.maxDiscount} onChange={(event) => setForm({ ...form, maxDiscount: event.target.value })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Starts" type="date" value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} />
            <Input label="Ends" type="date" value={form.endsAt} onChange={(event) => setForm({ ...form, endsAt: event.target.value })} />
          </div>
          <Select label="Merchant scope" value={form.merchantId} onChange={(event) => setForm({ ...form, merchantId: event.target.value })}>
            <option value="">All merchants</option>
            {merchants.filter((merchant) => merchant.status === "approved").map((merchant) => <option key={merchant.id} value={merchant.id}>{merchant.name}</option>)}
          </Select>
          <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-indigo" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />Active</label>
          <div className="flex gap-2">
            <Button loading={busy} onClick={submit}>{form.id ? "Save coupon" : "Create coupon"}</Button>
            {form.id ? <Button variant="ghost" onClick={() => setForm(emptyCoupon)}>Cancel</Button> : null}
          </div>
        </div>
      </AdminSection>
    </div>
  );
}