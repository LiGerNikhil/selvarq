"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPasswordSchema, resetPasswordSchema } from "@/lib/account-schemas";
import { toast } from "@/store/toast-store";

export function ForgotPasswordForm() {
  const [resetUrl, setResetUrl] = useState("");
  const [message, setMessage] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.input<typeof forgotPasswordSchema>>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { identifier: "" } });
  const submit = handleSubmit(async (values) => {
    setMessage(""); setResetUrl("");
    try {
      const response = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(values) });
      const result = await response.json() as { message?: string; resetUrl?: string; error?: string };
      if (!response.ok) { setMessage(result.error ?? "Could not start password reset."); return; }
      setMessage(result.message ?? "If your account exists, a reset link is ready.");
      if (result.resetUrl) setResetUrl(result.resetUrl);
    } catch (error) { console.error("Demo password reset request failed.", error); setMessage("We could not reach password reset. Try again."); }
  });
  return <form onSubmit={submit} noValidate className="space-y-4">
    <Input label="Email or mobile number" autoComplete="username" {...register("identifier")} error={errors.identifier?.message} />
    <Button type="submit" fullWidth loading={isSubmitting}>Create reset link</Button>
    {message ? <p role="status" className="text-sm text-muted">{message}</p> : null}
    {resetUrl ? <p className="border border-gold/40 bg-pearl p-3 text-sm">Demo reset link: <Link className="break-all text-indigo underline" href={resetUrl}>{resetUrl}</Link></p> : null}
    <p className="caption">Demo only: reset links are shown here; no email or SMS is sent.</p>
  </form>;
}

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.input<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "", confirmPassword: "" },
  });
  const submit = handleSubmit(async (values) => {
    setServerError("");
    try {
      const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(values) });
      const result = await response.json() as { error?: string; message?: string };
      if (!response.ok) { setServerError(result.error ?? "Could not reset password."); return; }
      toast.success(result.message ?? "Password updated");
      router.push("/login");
    } catch (error) { console.error("Demo password reset failed.", error); setServerError("We could not reach password reset. Try again."); }
  });
  return <form onSubmit={submit} noValidate className="space-y-4">
    {!token ? <p role="alert" className="text-sm text-danger">This reset link is missing its demo token. Request another link.</p> : null}
    <Input label="New password" type="password" autoComplete="new-password" {...register("password")} error={errors.password?.message} />
    <Input label="Confirm new password" type="password" autoComplete="new-password" {...register("confirmPassword")} error={errors.confirmPassword?.message} />
    {serverError ? <p role="alert" className="text-sm text-danger">{serverError}</p> : null}
    <Button type="submit" fullWidth loading={isSubmitting} disabled={!token}>Reset password</Button>
  </form>;
}
