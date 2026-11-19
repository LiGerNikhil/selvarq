"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaImage } from "@/components/ui/media-image";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/store/toast-store";
import { merchantProfileSchema } from "@/lib/merchant-schemas";

interface StoreProfile {
  displayName: string;
  bio: string;
  city: string;
  logoId: string;
}

export function MerchantProfileForm({ profile }: { profile: StoreProfile }) {
  const router = useRouter();
  const [form, setForm] = useState(profile);
  const [busy, setBusy] = useState(false);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = merchantProfileSchema.safeParse(form);
    if (!parsed.success) {
      toast.error("Check the storefront details", { description: parsed.error.issues[0]?.message ?? "Complete all required fields." });
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/merchant/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not save your storefront.");
      toast.success("Storefront updated");
      router.refresh();
    } catch (error) {
      toast.error("Could not save storefront", { description: error instanceof Error ? error.message : "Please try again." });
    } finally { setBusy(false); }
  }

  return <form onSubmit={save} className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
    <div className="space-y-4 border border-line p-4 sm:p-5">
      <Input label="Store name" value={form.displayName} onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))} required />
      <Input label="City" value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} required />
      <Textarea label="Brand story" value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} required hint="Tell shoppers about your materials, making and point of view." />
      <ImageUploader value={form.logoId ? [form.logoId] : []} onChange={(ids) => setForm((current) => ({ ...current, logoId: ids[0] ?? "" }))} folder="merchants" max={1} ratio="1/1" title="Brand mark" hint="A square image works best. Files upload to Cloudinary." />
      <Button type="submit" loading={busy}>Save storefront</Button>
    </div>
    <aside className="border border-line p-4"><p className="mb-3 text-sm font-medium text-indigo">Store preview</p><div className="mx-auto w-28"><MediaImage src={form.logoId} alt={`${form.displayName} brand mark`} ratio="1/1" sizes="112px" /></div><h3 className="mt-4 text-center font-display text-xl text-indigo">{form.displayName || "Your store"}</h3><p className="caption mt-1 text-center">{form.city}</p><p className="body mt-4">{form.bio || "Your brand story will appear here."}</p></aside>
  </form>;
}
