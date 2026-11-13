"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { notificationSchema } from "@/lib/account-schemas";
import { toast } from "@/store/toast-store";

type Values = z.input<typeof notificationSchema>;

export function NotificationsForm({ initial }: { initial: Values }) {
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(notificationSchema), defaultValues: initial });
  const submit = handleSubmit(async (values) => {
    setError("");
    try {
      const response = await fetch("/api/account", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ section: "notifications", values }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) { setError(result.error ?? "Could not save notifications."); return; }
      toast.success("Notification settings saved");
    } catch (requestError) { console.error("Could not save notification preferences.", requestError); setError("We could not save your settings. Please try again."); }
  });
  return <form onSubmit={submit} noValidate className="max-w-xl space-y-3">
    <Checkbox label="Email notes and announcements" description="Collection launches and occasional craft stories." {...register("email")} error={errors.email?.message} />
    <Checkbox label="SMS updates" description="Receive occasional messages to your mobile." {...register("sms")} error={errors.sms?.message} />
    <Checkbox label="Order updates" description="Delivery and account notices." {...register("orderUpdates")} error={errors.orderUpdates?.message} />
    {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}<Button type="submit" loading={isSubmitting}>Save settings</Button>
  </form>;
}
