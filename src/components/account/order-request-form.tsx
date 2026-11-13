"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { orderRequestSchema } from "@/lib/account-schemas";
import type { DemoOrderRequest } from "@/lib/demo-order-requests";
import { formatDate } from "@/lib/format";
import { toast } from "@/store/toast-store";

type Values = z.input<typeof orderRequestSchema>;

export function OrderRequestForm({ orderId, canCancel, canReturn, initialRequests }: { orderId: string; canCancel: boolean; canReturn: boolean; initialRequests: DemoOrderRequest[] }) {
  const [message, setMessage] = useState("");
  const [requests, setRequests] = useState(initialRequests);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(orderRequestSchema), defaultValues: { type: canCancel ? "cancel" : "return", reason: "" } });
  const submit = handleSubmit(async (values) => {
    setMessage("");
    try {
      const response = await fetch(`/api/account/orders/${encodeURIComponent(orderId)}/request`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json() as { error?: string; request?: DemoOrderRequest };
      if (!response.ok || !result.request) { setMessage(result.error ?? "Could not submit your request."); return; }
      const savedRequest = result.request;
      setRequests((current) => [savedRequest, ...current]);
      toast.success(`${values.type[0]?.toUpperCase()}${values.type.slice(1)} request received`);
      setMessage("Your request is pending review. The order status has not been changed.");
    } catch (error) { console.error("Could not submit demo order request.", error); setMessage("We could not submit your request. Please try again."); }
  });
  if (!canCancel && !canReturn) return <p className="caption">No cancellation, return or exchange request is currently available for this order.</p>;
  return <form onSubmit={submit} noValidate className="grid gap-3 sm:grid-cols-[12rem_minmax(0,1fr)_auto] sm:items-end">
    <label className="flex flex-col gap-1.5 text-sm">Request type<select {...register("type")} className="min-h-11 border border-line bg-ivory px-3">{canCancel ? <option value="cancel">Cancel order</option> : null}{canReturn ? <option value="return">Return item</option> : null}{canReturn ? <option value="exchange">Exchange item</option> : null}</select>{errors.type?.message ? <span className="text-xs text-danger">{errors.type.message}</span> : null}</label>
    <label className="flex flex-col gap-1.5 text-sm">Reason<textarea {...register("reason")} rows={2} className="min-h-11 border border-line bg-ivory px-3 py-2" placeholder="Tell us what happened" />{errors.reason?.message ? <span className="text-xs text-danger">{errors.reason.message}</span> : null}</label>
    <Button type="submit" variant="ghost" loading={isSubmitting}>Submit request</Button>
    {message ? <p role="status" className={`text-sm ${message.includes("pending review") ? "text-success" : "text-danger"} sm:col-span-3`}>{message}</p> : null}
    {requests.length ? <ul className="space-y-2 text-xs text-muted sm:col-span-3">{requests.map((request) => <li key={request.id} className="border-t border-line pt-2"><span className="capitalize">{request.type}</span> request received on {formatDate(request.createdAt)} · pending review</li>)}</ul> : null}
  </form>;
}
