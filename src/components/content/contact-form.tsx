"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/store/toast-store";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name.").max(80),
  email: z.string().trim().email("Enter a valid email address."),
  subject: z.string().trim().min(3, "Add a short subject.").max(120),
  message: z.string().trim().min(20, "Please share a little more detail.").max(2000),
});

type ContactValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactValues>({ resolver: zodResolver(contactSchema) });

  async function submit(values: ContactValues) {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Please try again.");
      toast.success("Message received", { description: "This demo does not send email; your message was not stored." });
      reset();
    } catch (error) {
      toast.error("Could not send your message", { description: error instanceof Error ? error.message : "Please try again." });
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="grid max-w-2xl gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Name" autoComplete="name" required error={errors.name?.message} {...register("name")} />
        <Input label="Email" type="email" autoComplete="email" required error={errors.email?.message} {...register("email")} />
      </div>
      <Input label="Subject" required error={errors.subject?.message} {...register("subject")} />
      <Textarea label="Message" rows={6} required error={errors.message?.message} {...register("message")} />
      <div>
        <Button type="submit" loading={isSubmitting}>Send message</Button>
        <p className="caption mt-3">Demo form: submissions are validated locally and are not sent or saved.</p>
      </div>
    </form>
  );
}
