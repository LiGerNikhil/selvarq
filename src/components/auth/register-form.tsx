"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { registerSchema } from "@/lib/account-schemas";
import { toast } from "@/store/toast-store";

type Values = z.input<typeof registerSchema>;
const strengthLabel = ["Add a number, symbol and more characters", "Getting stronger", "Good password", "Strong password"];

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", password: "", consent: false },
  });
  const password = useWatch({ control, name: "password" });
  const strength = useMemo(() => {
    if (!password) return 0;
    return [password.length >= 8, /[A-Z]/.test(password) && /[a-z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
  }, [password]);

  const submit = handleSubmit(async (values) => {
    setServerError("");
    try {
      const response = await fetch("/api/auth/register", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(values) });
      const result = await response.json() as { error?: string; next?: string };
      if (!response.ok || !result.next) { setServerError(result.error ?? "Could not create your account."); return; }
      toast.success("Welcome to SELVARQ", { description: "Your demo account is ready." });
      router.push(result.next);
    } catch (error) {
      console.error("Demo registration failed.", error);
      setServerError("We could not reach registration. Please try again.");
    }
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Input label="Full name" autoComplete="name" {...register("name")} error={errors.name?.message} />
      <Input label="Email address" type="email" autoComplete="email" {...register("email")} error={errors.email?.message} />
      <Input label="Mobile number" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} {...register("phone")} error={errors.phone?.message} />
      <div>
        <Input label="Password" type="password" autoComplete="new-password" {...register("password")} error={errors.password?.message} />
        <div className="mt-2" aria-live="polite">
          <div role="meter" aria-label="Password strength" aria-valuemin={0} aria-valuemax={4} aria-valuenow={strength} aria-valuetext={password ? strengthLabel[Math.min(strength, 3)] : "Not entered"} className="grid grid-cols-4 gap-1">
            {[1, 2, 3, 4].map((level) => <span key={level} className={`h-1 ${strength >= level ? "bg-indigo" : "bg-line"}`} />)}
          </div>
          <p className="caption mt-1">{password ? strengthLabel[Math.min(strength, 3)] : "Use at least 8 characters"}</p>
        </div>
      </div>
      <Checkbox label={<>I agree to the <Link className="text-indigo underline" href="/terms">terms</Link> and <Link className="text-indigo underline" href="/privacy">privacy policy</Link>.</>} {...register("consent")} error={errors.consent?.message} />
      {serverError ? <p role="alert" className="text-sm text-danger">{serverError}</p> : null}
      <Button type="submit" fullWidth loading={isSubmitting}>Create account</Button>
      <p className="caption text-center">Demo only. Do not use a real password.</p>
    </form>
  );
}
