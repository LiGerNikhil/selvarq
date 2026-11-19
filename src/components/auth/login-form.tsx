"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/lib/account-schemas";
import { toast } from "@/store/toast-store";

type Values = z.input<typeof loginSchema>;
type Role = "customer" | "merchant" | "admin";

/**
 * The `next` query param comes from a role-gated redirect, so it may point at a
 * section the signing-in account cannot open (an admin landing on
 * `/login?next=/account`, for example). Only honour it when the role matches;
 * otherwise fall back to the role's home returned by the API.
 */
function canOpen(path: string, role: Role): boolean {
  if (path === "/admin" || path.startsWith("/admin/")) return role === "admin";
  if (path === "/merchant/register") return true;
  if (path === "/merchant" || path.startsWith("/merchant/")) return role === "merchant";
  if (path === "/account" || path.startsWith("/account/")) return role === "customer";
  if (path === "/onboarding") return role === "customer";
  return true;
}

export function LoginForm({ next = "" }: { next?: string }) {
  const router = useRouter();
  const [method, setMethod] = useState<"password" | "otp">("password");
  const [otpRequested, setOtpRequested] = useState(false);
  const [serverError, setServerError] = useState("");
  const { register, control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", method: "password", password: "", otp: "" },
  });
  const identifier = useWatch({ control, name: "identifier" });

  const submit = handleSubmit(async (values) => {
    setServerError("");
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...values, method }) });
      const result = await response.json() as { error?: string; next?: string; role?: Role };
      if (!response.ok) { setServerError(result.error ?? "Sign in was unsuccessful."); return; }
      const fallback = result.next ?? "/account";
      const requested = next.startsWith("/") && !next.startsWith("//") ? next : "";
      const target = requested && requested !== "/login" && (!result.role || canOpen(requested, result.role))
        ? requested
        : fallback;
      toast.success("You are signed in");
      router.push(target);
      router.refresh();
    } catch (error) {
      console.error("Demo sign-in failed.", error);
      setServerError("We could not reach sign in. Please try again.");
    }
  });

  function chooseMethod(value: "password" | "otp") {
    setMethod(value);
    setValue("method", value);
    setServerError("");
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Input label="Email or mobile number" autoComplete="username" {...register("identifier")} error={errors.identifier?.message} />
      <div className="grid grid-cols-2 border-b border-line" role="tablist" aria-label="Sign-in method">
        <button type="button" role="tab" aria-selected={method === "password"} onClick={() => chooseMethod("password")} className={`min-h-11 border-b-2 text-sm ${method === "password" ? "border-indigo text-indigo" : "border-transparent text-muted"}`}>Password</button>
        <button type="button" role="tab" aria-selected={method === "otp"} onClick={() => chooseMethod("otp")} className={`min-h-11 border-b-2 text-sm ${method === "otp" ? "border-indigo text-indigo" : "border-transparent text-muted"}`}>Mock OTP</button>
      </div>
      {method === "password" ? <Input label="Password" type="password" autoComplete="current-password" {...register("password")} error={errors.password?.message} /> : (
        <div className="space-y-2">
          <Input label="6-digit OTP" inputMode="numeric" autoComplete="one-time-code" maxLength={6} {...register("otp")} error={errors.otp?.message} />
          <Button type="button" variant="quiet" size="sm" onClick={() => { setOtpRequested(true); setValue("method", "otp"); }}>Send demo OTP</Button>
          {otpRequested ? <p role="status" className="caption">Demo OTP: <strong className="text-indigo">123456</strong>. No message is sent.</p> : null}
        </div>
      )}
      <div className="text-right"><Link href="/forgot-password" className="text-sm text-indigo underline underline-offset-4">Forgot password?</Link></div>
      {serverError ? <p role="alert" className="text-sm text-danger">{serverError}</p> : null}
      <Button type="submit" fullWidth loading={isSubmitting}>Sign in</Button>
      <div className="relative py-2 text-center"><span className="bg-ivory px-3 text-xs text-muted">OR</span><span className="absolute inset-x-0 top-1/2 -z-10 border-t border-line" /></div>
      <div className="grid grid-cols-2 gap-3">
        <Button type="button" variant="ghost" disabled title="Social sign-in is not connected">Google (soon)</Button>
        <Button type="button" variant="ghost" disabled title="Social sign-in is not connected">Apple (soon)</Button>
      </div>
      {identifier ? <p className="sr-only" aria-live="polite">Signing in with the selected {method} option.</p> : null}
    </form>
  );
}
