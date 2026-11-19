"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { ArrowLeft, ArrowRight, FileImage, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaImage } from "@/components/ui/media-image";
import { ImageUploadButton } from "@/components/ui/image-uploader";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { merchantApplicationSchema, type MerchantApplicationInput } from "@/lib/merchant-schemas";

const steps = ["Your account", "Business details", "Payout & pickup", "Brand & documents", "Review & terms"];
const stepFields: (keyof MerchantApplicationInput)[][] = [
  ["ownerName", "email", "phone", "password"],
  ["businessName", "displayName", "city", "gstDeclaration", "gstin", "pan"],
  ["bank", "pickupAddress"],
  ["bio", "logoName", "documents"],
  ["termsAccepted"],
];
type DocumentKind = "pan_card" | "gst_certificate" | "cancelled_cheque" | "address_proof" | "other";

export function MerchantRegistrationForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [documentType, setDocumentType] = useState<DocumentKind>("pan_card");
  const [documents, setDocuments] = useState<MerchantApplicationInput["documents"]>([]);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");
  const form = useForm<MerchantApplicationInput>({
    resolver: zodResolver(merchantApplicationSchema),
    mode: "onSubmit",
    defaultValues: {
      gstDeclaration: "registered",
      documents: [],
      termsAccepted: false,
      bank: { accountHolder: "", accountNumber: "", ifsc: "", bankName: "" },
      pickupAddress: { line1: "", city: "", state: "", pincode: "" },
    },
  });
  const { register, control, setValue, getValues, trigger, formState: { errors } } = form;
  const values = useWatch({ control });

  async function next() {
    if (await trigger(stepFields[step])) setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  async function submit() {
    const valid = await trigger();
    if (!valid) {
      const currentErrors = form.formState.errors;
      const firstInvalid = stepFields.findIndex((fields) => fields.some((field) => Boolean(currentErrors[field])));
      setStep(firstInvalid < 0 ? 0 : firstInvalid);
      return;
    }
    setBusy(true);
    setServerError("");
    try {
      const response = await fetch("/api/merchant/applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(getValues()) });
      const result = await response.json() as { error?: string; next?: string };
      if (!response.ok || !result.next) throw new Error(result.error ?? "Could not submit your seller application.");
      router.push(result.next);
      router.refresh();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Could not submit your seller application.");
    } finally { setBusy(false); }
  }

  function addFiles(files: FileList | null, type: DocumentKind) {
    if (!files?.length) return;
    const selected = Array.from(files).slice(0, 5);
    const nextDocs = [...documents, ...selected.map((file) => ({ type, fileName: file.name }))].slice(0, 8);
    setDocuments(nextDocs);
    setValue("documents", nextDocs, { shouldValidate: true });
  }

  const gstDeclaration = values.gstDeclaration;
  const logoPreview = values.logoId
    ? values.logoId
    : values.logoName
      ? `placeholder:merchant-logo-${values.logoName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`
      : "placeholder:merchant-logo";

  return <section className="mt-9 border border-line bg-ivory p-4 sm:p-7">
    <ol aria-label="Application progress" className="grid grid-cols-5 gap-2">{steps.map((label, index) => <li key={label} aria-current={step === index ? "step" : undefined} className="min-w-0"><span className={`block h-1 ${index <= step ? "bg-indigo" : "bg-line"}`} /><span className={`mt-2 block truncate text-[11px] uppercase tracking-wide sm:text-xs ${step === index ? "font-medium text-indigo" : "text-muted"}`}>{label}</span></li>)}</ol>
    <form className="mt-8 space-y-5" onSubmit={(event) => event.preventDefault()} noValidate>
      {step === 0 ? <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Owner / contact name" required {...register("ownerName")} error={errors.ownerName?.message} />
        <Input label="Email" type="email" autoComplete="email" required {...register("email")} error={errors.email?.message} />
        <Input label="Mobile number" type="tel" inputMode="numeric" required {...register("phone")} error={errors.phone?.message} />
        <Input label="Password" type="password" autoComplete="new-password" required hint="At least 8 characters. Demo-only sign-in." {...register("password")} error={errors.password?.message} />
      </div> : null}
      {step === 1 ? <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Legal business name" required {...register("businessName")} error={errors.businessName?.message} />
        <Input label="Storefront / brand name" required {...register("displayName")} error={errors.displayName?.message} />
        <Input label="Business city" required {...register("city")} error={errors.city?.message} />
        <Select label="GST status" {...register("gstDeclaration", { onChange: (event) => { if (event.target.value === "unregistered") setValue("gstin", ""); } })}><option value="registered">GST registered</option><option value="unregistered">Unregistered declaration</option></Select>
        {gstDeclaration === "registered" ? <Input label="GSTIN" required className="uppercase" {...register("gstin")} error={errors.gstin?.message} /> : <p className="caption sm:col-span-2">You are applying as an unregistered seller. The declaration is recorded for this demo; confirm eligibility with your tax adviser.</p>}
        <Input label="PAN" required className="uppercase" {...register("pan")} error={errors.pan?.message} />
      </div> : null}
      {step === 2 ? <div className="space-y-6">
        <div><h2 className="mb-4 text-sm font-medium text-indigo">Bank account for seller payouts</h2><div className="grid gap-4 sm:grid-cols-2">
          <Input label="Account holder" required {...register("bank.accountHolder")} error={errors.bank?.accountHolder?.message} />
          <Input label="Bank name" required {...register("bank.bankName")} error={errors.bank?.bankName?.message} />
          <Input label="Account number" inputMode="numeric" required {...register("bank.accountNumber")} error={errors.bank?.accountNumber?.message} />
          <Input label="IFSC" required className="uppercase" {...register("bank.ifsc")} error={errors.bank?.ifsc?.message} />
        </div></div>
        <div><h2 className="mb-4 text-sm font-medium text-indigo">Pickup address</h2><div className="grid gap-4 sm:grid-cols-2">
          <Input label="Address" required className="sm:col-span-2" {...register("pickupAddress.line1")} error={errors.pickupAddress?.line1?.message} />
          <Input label="City" required {...register("pickupAddress.city")} error={errors.pickupAddress?.city?.message} />
          <Input label="State" required {...register("pickupAddress.state")} error={errors.pickupAddress?.state?.message} />
          <Input label="PIN code" inputMode="numeric" required {...register("pickupAddress.pincode")} error={errors.pickupAddress?.pincode?.message} />
        </div></div>
      </div> : null}
      {step === 3 ? <div className="space-y-5">
        <Textarea label="Your brand story" required hint="Tell us about your craft, materials and makers (40–600 characters)." {...register("bio")} error={errors.bio?.message} />
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="border border-dashed border-line p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-indigo"><FileImage aria-hidden className="size-4" />Brand logo</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="w-16 shrink-0 border border-line p-1"><MediaImage src={logoPreview} alt="Brand logo preview" ratio="1/1" sizes="64px" /></div>              <div className="min-w-0 flex-1 space-y-2">
                <ImageUploadButton
                  folder="seller-applications"
                  remaining={1}
                  label={values.logoId ? "Replace logo" : "Choose logo"}
                  onUploaded={(assets) => {
                    const asset = assets[0];
                    if (!asset) return;
                    setValue("logoName", asset.originalName, { shouldValidate: true });
                    setValue("logoId", asset.publicId, { shouldValidate: true });
                  }}
                />
                <span className="caption block truncate">{values.logoName || "No file selected."}</span>
              </div>
            </div>
            {errors.logoName ? <p role="alert" className="mt-2 text-sm text-danger">{errors.logoName.message}</p> : null}
          </div>
          <div className="border border-dashed border-line p-4"><label className="flex flex-col gap-2 text-sm font-medium text-indigo"><span className="flex items-center gap-2"><FileText aria-hidden className="size-4" />Supporting documents</span><Select aria-label="Document type" value={documentType} onChange={(event) => setDocumentType(event.target.value as DocumentKind)}><option value="pan_card">PAN card</option><option value="gst_certificate">GST certificate</option><option value="cancelled_cheque">Cancelled cheque</option><option value="address_proof">Address proof</option><option value="other">Other</option></Select><input type="file" multiple onChange={(event) => addFiles(event.target.files, documentType)} /></label><p className="caption mt-2">Files stay on your device. Thumbnails are simulated previews; nothing is uploaded or stored.</p></div>
        </div>
        {documents.length ? <ul className="grid gap-2 sm:grid-cols-2">{documents.map((document, index) => <li key={`${document.fileName}-${index}`} className="flex items-center gap-3 border border-line p-2 text-sm"><div className="w-10 shrink-0"><MediaImage src={`placeholder:document-${index}-${document.fileName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`} alt={`${document.fileName} preview`} ratio="1/1" sizes="40px" /></div><span className="min-w-0 flex-1 truncate">{document.fileName} <span className="caption">· {document.type.replaceAll("_", " ")}</span></span><button type="button" className="text-xs text-danger underline" onClick={() => { const nextDocs = documents.filter((_, current) => current !== index); setDocuments(nextDocs); setValue("documents", nextDocs, { shouldValidate: true }); }}>Remove</button></li>)}</ul> : null}
        {errors.documents?.message ? <p role="alert" className="text-sm text-danger">{errors.documents.message}</p> : null}
      </div> : null}
      {step === 4 ? <div className="space-y-5">
        <div className="grid gap-3 rounded-ui bg-pearl p-4 text-sm sm:grid-cols-2"><p><span className="caption block">Contact</span>{values.ownerName} · {values.email}</p><p><span className="caption block">Business</span>{values.businessName} · {values.displayName}</p><p><span className="caption block">Tax status</span>{gstDeclaration === "registered" ? `GSTIN ${values.gstin}` : "Unregistered declaration"} · PAN {values.pan}</p><p><span className="caption block">Documents</span>{documents.map((item) => item.fileName).join(", ")}</p></div>
        <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={values.termsAccepted} onChange={(event) => setValue("termsAccepted", event.target.checked, { shouldValidate: true })} className="mt-1 size-4 accent-indigo" /><span>I confirm these business details are accurate and agree to the seller terms and platform policies.</span></label>
        {errors.termsAccepted ? <p role="alert" className="text-sm text-danger">{errors.termsAccepted.message}</p> : null}
        <p className="caption">Commission in this demo is 12% of seller item subtotal. Final terms are confirmed before launch.</p>
      </div> : null}
      {serverError ? <p role="alert" className="text-sm text-danger">{serverError}</p> : null}
      <div className="flex flex-col-reverse justify-between gap-3 border-t border-line pt-5 sm:flex-row">
        <Button type="button" variant="quiet" disabled={step === 0 || busy} leftIcon={<ArrowLeft aria-hidden className="size-4" />} onClick={() => setStep((current) => Math.max(0, current - 1))}>Back</Button>
        {step < steps.length - 1 ? <Button type="button" onClick={next}>Continue <ArrowRight aria-hidden className="ml-2 size-4" /></Button> : <Button type="button" loading={busy} onClick={submit}>Submit application</Button>}
      </div>
    </form>
  </section>;
}
