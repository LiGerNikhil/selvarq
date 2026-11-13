"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { copy } from "@/data/copy";

const schema = z.object({
  email: z.email(copy.errors.email),
  phone: z.string().regex(/^[6-9]\d{9}$/, copy.errors.phone),
  consent: z.boolean().refine((v) => v, "Please agree to continue."),
});
type FormValues = z.infer<typeof schema>;

/** react-hook-form + zod: the pattern every form in the app follows. */
export function FormDemo() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", phone: "", consent: false },
  });

  async function onSubmit(values: FormValues) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    toast.success("You are on the list", { description: values.email });
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex max-w-md flex-col gap-4">
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        label="Mobile number"
        type="tel"
        autoComplete="tel-national"
        inputMode="numeric"
        maxLength={10}
        hint="10 digits, no country code."
        required
        error={errors.phone?.message}
        {...register("phone")}
      />
      <Checkbox
        label="Send me new arrivals and festive edits"
        error={errors.consent?.message}
        {...register("consent")}
      />
      <Button type="submit" loading={isSubmitting} fullWidth>
        Join the list
      </Button>
    </form>
  );
}
