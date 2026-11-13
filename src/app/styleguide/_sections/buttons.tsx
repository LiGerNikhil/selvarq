import { ArrowRight, Heart } from "lucide-react";
import { Button, ButtonLink, type ButtonVariant } from "@/components/ui/button";
import { Section, Specimen } from "./section";

const variants: ButtonVariant[] = ["primary", "ghost", "quiet", "danger"];

export function ButtonsSection() {
  return (
    <Section id="buttons" eyebrow="Actions" title="Buttons">
      <Specimen label="Variants and sizes" note="Hover for the gold hairline on primary. Tab to see the focus ring.">
        <div className="flex flex-col gap-4">
          {(["sm", "md", "lg"] as const).map((size) => (
            <div key={size} className="flex flex-wrap items-center gap-3">
              {variants.map((variant) => (
                <Button key={variant} variant={variant} size={size}>
                  {variant}
                </Button>
              ))}
            </div>
          ))}
        </div>
      </Specimen>

      <Specimen label="States" note="Disabled, loading (also disables), and with icons.">
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled>Disabled</Button>
          <Button variant="ghost" disabled>
            Disabled
          </Button>
          <Button loading>Placing order</Button>
          <Button variant="ghost" loading>
            Saving
          </Button>
          <Button leftIcon={<Heart aria-hidden className="size-4" />}>Save</Button>
          <Button variant="ghost" rightIcon={<ArrowRight aria-hidden className="size-4" />}>
            Continue
          </Button>
        </div>
      </Specimen>

      <Specimen label="Full width and links" note="Full width is the default on narrow screens in forms and sticky bars.">
        <div className="flex max-w-sm flex-col gap-3">
          <Button fullWidth size="lg">
            Add to bag
          </Button>
          <ButtonLink href="/" variant="ghost" fullWidth>
            Back to home
          </ButtonLink>
          <ButtonLink href="/" variant="quiet">
            Read our story
          </ButtonLink>
        </div>
      </Specimen>
    </Section>
  );
}
