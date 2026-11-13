"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addressSchema } from "@/lib/account-schemas";
import type { Address } from "@/types/user";
import { toast } from "@/store/toast-store";

type Values = z.input<typeof addressSchema>;
const emptyAddress: Values = { label: "Home", fullName: "", phone: "", line1: "", line2: "", landmark: "", city: "", state: "", pincode: "", isDefault: false };

export function AddressManager({ initial }: { initial: Address[] }) {
  const [addresses, setAddresses] = useState(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(addressSchema), defaultValues: emptyAddress });

  function startEdit(address?: Address) {
    setEditing(address?.id ?? "new");
    reset(address ?? emptyAddress);
    setError("");
  }

  const submit = handleSubmit(async (values) => {
    setError("");
    try {
      const response = await fetch("/api/account/addresses", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...values, ...(editing && editing !== "new" ? { id: editing } : {}) }) });
      const result = await response.json() as { error?: string; address?: Address };
      if (!response.ok || !result.address) { setError(result.error ?? "Could not save this address."); return; }
      const savedAddress = result.address;
      setAddresses((current) => {
        const updated = current.map((address) => savedAddress.isDefault ? { ...address, isDefault: false } : address);
        const index = updated.findIndex((address) => address.id === savedAddress.id);
        if (index >= 0) updated[index] = savedAddress;
        else updated.push(savedAddress);
        return updated.map((address, i) => ({ ...address, isDefault: savedAddress.isDefault ? address.id === savedAddress.id : address.isDefault || (updated.length === 1 && i === 0) }));
      });
      setEditing(null);
      toast.success("Address saved");
    } catch (requestError) { console.error("Could not save demo address.", requestError); setError("We could not save this address. Please try again."); }
  });

  async function remove(id: string) {
    setError("");
    try {
      const response = await fetch("/api/account/addresses", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) { setError(result.error ?? "Could not remove this address."); return; }
      setAddresses((current) => {
        const next = current.filter((item) => item.id !== id);
        if (!next.some((item) => item.isDefault) && next[0]) next[0] = { ...next[0], isDefault: true };
        return next;
      });
      toast.success("Address removed");
    } catch (requestError) {
      console.error("Could not remove demo address.", requestError);
      setError("We could not remove this address. Please try again.");
    }
  }

  return <div className="space-y-5">
    {addresses.map((address) => <article key={address.id} className="border border-line p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><div className="flex flex-wrap items-center gap-2"><h2 className="font-medium">{address.label}</h2>{address.isDefault ? <span className="bg-pearl px-2 py-1 text-[10px] uppercase tracking-wide text-indigo">Default</span> : null}</div>
          <p className="mt-2 text-sm text-muted">{address.fullName} · {address.phone}<br />{address.line1}{address.line2 ? `, ${address.line2}` : ""}{address.landmark ? `, near ${address.landmark}` : ""}<br />{address.city}, {address.state} {address.pincode}</p></div>
        <div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => startEdit(address)}>Edit</Button><Button variant="quiet" size="sm" onClick={() => void remove(address.id)}>Remove</Button></div>
      </div>
    </article>)}
    {editing ? <form onSubmit={submit} noValidate className="grid gap-4 border border-gold/40 bg-pearl p-4 sm:grid-cols-2 sm:p-5">
      <h2 className="text-sm font-medium sm:col-span-2">{editing === "new" ? "Add an address" : "Edit address"}</h2>
      <label className="flex flex-col gap-1.5 text-sm">Address label<select {...register("label")} className="min-h-11 border border-line bg-ivory px-3"><option>Home</option><option>Work</option><option>Other</option></select></label>
      <Input label="Recipient name" autoComplete="name" {...register("fullName")} error={errors.fullName?.message} />
      <Input label="Mobile number" type="tel" inputMode="numeric" {...register("phone")} error={errors.phone?.message} />
      <Input label="Address line 1" {...register("line1")} error={errors.line1?.message} />
      <Input label="Address line 2" {...register("line2")} error={errors.line2?.message} />
      <Input label="Landmark (optional)" {...register("landmark")} error={errors.landmark?.message} />
      <Input label="City" {...register("city")} error={errors.city?.message} />
      <Input label="State" {...register("state")} error={errors.state?.message} />
      <Input label="PIN code" inputMode="numeric" maxLength={6} {...register("pincode")} error={errors.pincode?.message} />
      <label className="flex min-h-11 items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" {...register("isDefault")} /> Set as default address</label>
      {error ? <p role="alert" className="text-sm text-danger sm:col-span-2">{error}</p> : null}
      <div className="flex gap-3 sm:col-span-2"><Button type="submit" loading={isSubmitting}>Save address</Button><Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button></div>
    </form> : <Button variant="ghost" onClick={() => startEdit()}>Add new address</Button>}
  </div>;
}
