"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup } from "@/components/ui/radio";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormDemo } from "./form-demo";
import { Section, Specimen } from "./section";

const delivery = [
  { value: "standard", label: "Standard delivery", description: "3 to 7 days. Free above Rs 1,999." },
  { value: "express", label: "Express delivery", description: "1 to 3 days." },
  { value: "pickup", label: "Collect from store", description: "Not available in your area.", disabled: true },
];

export function FormsSection() {
  const [method, setMethod] = useState("standard");
  const [saved, setSaved] = useState(true);

  return (
    <Section id="forms" eyebrow="Inputs" title="Form controls">
      <Specimen label="Text inputs" note="Default, with hint, required, error, disabled.">
        <div className="grid gap-5 md:grid-cols-2">
          <Input label="Full name" autoComplete="name" placeholder="As on your ID" />
          <Input label="PIN code" inputMode="numeric" autoComplete="postal-code" maxLength={6} hint="6 digits." />
          <Input label="Email" type="email" autoComplete="email" required defaultValue="aarav@example" error="Enter a valid email address." />
          <Input label="Coupon code" disabled defaultValue="WELCOME10" />
        </div>
      </Specimen>

      <Specimen label="Textarea and select">
        <div className="grid gap-5 md:grid-cols-2">
          <Textarea label="Delivery instructions" hint="Gate code, landmark, preferred time." />
          <Select label="State" autoComplete="address-level1" defaultValue="">
            <option value="" disabled>
              Choose a state
            </option>
            <option>Delhi</option>
            <option>Karnataka</option>
            <option>Maharashtra</option>
            <option>Tamil Nadu</option>
          </Select>
          <Select label="Size" error="Choose a size to continue." defaultValue="">
            <option value="" disabled>
              Select
            </option>
            <option>S</option>
            <option>M</option>
          </Select>
          <Select label="Sort" disabled defaultValue="new">
            <option value="new">Newest</option>
          </Select>
        </div>
      </Specimen>

      <Specimen label="Checkbox" note="Unchecked, checked (controlled), with description, error, disabled.">
        <div className="flex max-w-md flex-col">
          <Checkbox label="Gift wrap this order" />
          <Checkbox label="Save this address" description="Use it again at checkout." checked={saved} onChange={(e) => setSaved(e.target.checked)} />
          <Checkbox label="I agree to the terms" error="Please agree to continue." />
          <Checkbox label="Unavailable option" disabled />
          <Checkbox label="Checked and disabled" disabled defaultChecked />
        </div>
      </Specimen>

      <Specimen label="Radio group" note={`Controlled. Selected: ${method}.`}>
        <RadioGroup legend="Delivery method" name="delivery" options={delivery} value={method} onValueChange={setMethod} className="max-w-md" />
      </Specimen>

      <Specimen label="Validated form" note="react-hook-form with a zod schema. Submit empty to see errors, then fill it in.">
        <FormDemo />
      </Specimen>
    </Section>
  );
}
