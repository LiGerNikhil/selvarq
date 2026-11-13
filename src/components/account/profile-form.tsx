"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { profileSchema } from "@/lib/account-schemas";
import { toast } from "@/store/toast-store";
import { useState } from "react";

type Values = z.input<typeof profileSchema>;

export function ProfileForm({ initial }: { initial: Values }) {
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(profileSchema), defaultValues: initial });
  const submit = handleSubmit(async (values) => {
    setServerError("");
    try {
      const response = await fetch("/api/account", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ section: "profile", values }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) { setServerError(result.error ?? "Could not save your profile."); return; }
      toast.success("Profile updated");
    } catch (error) { console.error("Could not save demo profile.", error); setServerError("We could not save your profile. Please try again."); }
  });
  return <form onSubmit={submit} noValidate className="max-w-xl space-y-4">
    <Input label="Full name" autoComplete="name" {...register("name")} error={errors.name?.message} />
    <Input label="Email address" type="email" autoComplete="email" {...register("email")} error={errors.email?.message} />
    <Input label="Mobile number" type="tel" inputMode="numeric" autoComplete="tel-national" {...register("phone")} error={errors.phone?.message} />
    {serverError ? <p role="alert" className="text-sm text-danger">{serverError}</p> : null}
    <Button type="submit" loading={isSubmitting}>Save changes</Button>
  </form>;
}
