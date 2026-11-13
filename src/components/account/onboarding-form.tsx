"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { preferencesSchema } from "@/lib/account-schemas";
import { toast } from "@/store/toast-store";
import type { Category } from "@/data";

type Values = z.input<typeof preferencesSchema>;
const styles = ["Minimal", "Handloom", "Festive", "Contemporary", "Workwear", "Natural fibres"];
const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

export function OnboardingForm({ categories, initial }: { categories: Category[]; initial: Values }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const { control, register, getValues, setValue, handleSubmit, formState: { isSubmitting } } = useForm<Values>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: initial,
  });
  const gender = useWatch({ control, name: "gender" }) ?? initial.gender;
  const selectedStyles = useWatch({ control, name: "styles" }) ?? initial.styles;
  const selectedSizes = useWatch({ control, name: "usualSizes" }) ?? initial.usualSizes;
  const selectedCategories = useWatch({ control, name: "favoriteCategories" }) ?? initial.favoriteCategories;
  const submit = handleSubmit(async (formValues) => save({ ...formValues, onboardingComplete: true }));

  async function save(preferences: Values) {
    setError("");
    try {
      const response = await fetch("/api/account", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ section: "preferences", values: { ...preferences, onboardingComplete: true } }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) { setError(result.error ?? "Could not save your preferences."); return; }
      toast.success("Your edit is ready", { description: "We will use your choices to tailor For you." });
      router.push("/");
      router.refresh();
    } catch (requestError) {
      console.error("Could not save demo onboarding preferences.", requestError);
      setError("We could not save your choices. Please try again.");
    }
  }

  function toggle(field: "styles" | "usualSizes" | "favoriteCategories", value: string) {
    const current = getValues(field) ?? [];
    setValue(field, current.includes(value) ? current.filter((item) => item !== value) : [...current, value], { shouldDirty: true });
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-7">
      <ol aria-label="Onboarding progress" className="grid grid-cols-3 gap-2">
        {["Your style", "Your sizes", "Your favourites"].map((label, index) => <li key={label} className={`border-b-2 pb-2 text-xs ${step === index ? "border-indigo text-indigo" : "border-line text-muted"}`}>{index + 1}. {label}</li>)}
      </ol>
      {step === 0 ? <section>
        <fieldset><legend className="mb-3 text-sm font-medium">Which edit should we start with?</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[["men", "Men"], ["women", "Women"], ["unisex", "Unisex"], ["no_preference", "Show me all"]].map(([value, label]) => <label key={value} className={`flex min-h-11 cursor-pointer items-center gap-2 border p-3 text-sm ${gender === value ? "border-indigo bg-indigo/5" : "border-line"}`}><input type="radio" value={value} {...register("gender")} />{label}</label>)}
          </div>
        </fieldset>
        <fieldset className="mt-6"><legend className="mb-2 text-sm font-medium">Styles you enjoy</legend><div className="grid grid-cols-2 gap-x-4">{styles.map((style) => <Checkbox key={style} label={style} checked={selectedStyles.includes(style)} onChange={() => toggle("styles", style)} />)}</div></fieldset>
      </section> : null}
      {step === 1 ? <section>
        <h2 className="text-sm font-medium">Usual sizes</h2><p className="caption mt-1">Choose sizes you reach for. You can update these any time.</p>
        <Controller control={control} name="usualSizes" render={() => <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">{sizes.map((size) => <button key={size} type="button" aria-pressed={selectedSizes.includes(size)} onClick={() => toggle("usualSizes", size)} className={`min-h-12 border text-sm ${selectedSizes.includes(size) ? "border-indigo bg-indigo text-ivory" : "border-line"}`}>{size}</button>)}</div>} />
      </section> : null}
      {step === 2 ? <section>
        <h2 className="text-sm font-medium">Favourite categories</h2><p className="caption mt-1">Pick a few to shape your For you rail.</p>
        <Controller control={control} name="favoriteCategories" render={() => <div className="mt-4 grid grid-cols-2 gap-x-4 sm:grid-cols-3">{categories.map((category) => <Checkbox key={category.id} label={category.name} checked={selectedCategories.includes(category.id)} onChange={() => toggle("favoriteCategories", category.id)} />)}</div>} />
      </section> : null}
      {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
      <div className="flex flex-wrap justify-between gap-3">
        <Button type="button" variant="ghost" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>Back</Button>
        {step < 2 ? <Button type="button" onClick={() => setStep((current) => current + 1)}>Continue</Button> : <Button type="submit" loading={isSubmitting}>Finish</Button>}
        <Button type="button" variant="quiet" onClick={() => save({ ...getValues(), onboardingComplete: true })}>Skip for now</Button>
      </div>
    </form>
  );
}
