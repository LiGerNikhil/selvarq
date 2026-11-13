"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import type { Category } from "@/data";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { preferencesSchema } from "@/lib/account-schemas";
import type { CustomerPreferences } from "@/lib/demo-account-store";
import { toast } from "@/store/toast-store";

type Values = z.input<typeof preferencesSchema>;
const styles = ["Minimal", "Handloom", "Festive", "Contemporary", "Workwear", "Natural fibres"];
const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

export function PreferencesForm({ initial, categories }: { initial: CustomerPreferences; categories: Category[] }) {
  const [error, setError] = useState("");
  const { register, control, setValue, handleSubmit, formState: { isSubmitting } } = useForm<Values>({ resolver: zodResolver(preferencesSchema), defaultValues: initial });
  const gender = useWatch({ control, name: "gender" }) ?? initial.gender;
  const selectedStyles = useWatch({ control, name: "styles" }) ?? initial.styles;
  const selectedSizes = useWatch({ control, name: "usualSizes" }) ?? initial.usualSizes;
  const selectedCategories = useWatch({ control, name: "favoriteCategories" }) ?? initial.favoriteCategories;
  function toggle(field: "styles" | "usualSizes" | "favoriteCategories", value: string) {
    const current = valuesFor(field);
    setValue(field, current.includes(value) ? current.filter((item) => item !== value) : [...current, value], { shouldDirty: true });
  }
  function valuesFor(field: "styles" | "usualSizes" | "favoriteCategories") {
    return field === "styles" ? selectedStyles : field === "usualSizes" ? selectedSizes : selectedCategories;
  }
  const submit = handleSubmit(async (formValues) => {
    setError("");
    try {
      const response = await fetch("/api/account", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ section: "preferences", values: { ...formValues, onboardingComplete: true } }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) { setError(result.error ?? "Could not save preferences."); return; }
      toast.success("Preferences saved");
    } catch (requestError) { console.error("Could not save customer preferences.", requestError); setError("We could not save your preferences. Please try again."); }
  });
  return <form onSubmit={submit} noValidate className="space-y-7">
    <fieldset><legend className="mb-2 text-sm font-medium">Shop for</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {[["men", "Men"], ["women", "Women"], ["unisex", "Unisex"], ["no_preference", "All"]].map(([value, label]) => <label key={value} className={`flex min-h-11 items-center gap-2 border p-3 text-sm ${gender === value ? "border-indigo bg-indigo/5" : "border-line"}`}><input type="radio" value={value} {...register("gender")} />{label}</label>)}
    </div></fieldset>
    <fieldset><legend className="mb-2 text-sm font-medium">Style notes</legend><div className="grid grid-cols-2 gap-x-4 sm:grid-cols-3">{styles.map((item) => <Checkbox key={item} label={item} checked={selectedStyles.includes(item)} onChange={() => toggle("styles", item)} />)}</div></fieldset>
    <fieldset><legend className="mb-2 text-sm font-medium">Usual sizes</legend><Controller control={control} name="usualSizes" render={() => <div className="flex flex-wrap gap-2">{sizes.map((item) => <button key={item} type="button" aria-pressed={selectedSizes.includes(item)} onClick={() => toggle("usualSizes", item)} className={`min-h-11 min-w-12 border text-sm ${selectedSizes.includes(item) ? "border-indigo bg-indigo text-ivory" : "border-line"}`}>{item}</button>)}</div>} /></fieldset>
    <fieldset><legend className="mb-2 text-sm font-medium">Favourite categories</legend><Controller control={control} name="favoriteCategories" render={() => <div className="grid grid-cols-2 gap-x-4 sm:grid-cols-3">{categories.map((item) => <Checkbox key={item.id} label={item.name} checked={selectedCategories.includes(item.id)} onChange={() => toggle("favoriteCategories", item.id)} />)}</div>} /></fieldset>
    {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}<Button type="submit" loading={isSubmitting}>Save preferences</Button>
  </form>;
}
