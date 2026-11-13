"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { RadioGroup } from "@/components/ui/radio";
import { Sheet, type SheetSide } from "@/components/ui/sheet";
import { toast } from "@/components/ui/toast";
import { Section, Specimen } from "./section";

const sorts = [
  { value: "new", label: "Newest" },
  { value: "low", label: "Price: low to high" },
  { value: "high", label: "Price: high to low" },
  { value: "rated", label: "Top rated" },
];

const fabrics = ["Cotton", "Linen", "Silk blend", "Wool blend"];

const sheetDemos: { side: SheetSide; label: string }[] = [
  { side: "responsive", label: "Responsive sheet" },
  { side: "right", label: "Right drawer" },
  { side: "left", label: "Left drawer" },
  { side: "bottom", label: "Bottom sheet" },
];

export function OverlaysSection() {
  const [sheet, setSheet] = useState<SheetSide | null>(null);
  const [dialog, setDialog] = useState(false);
  const [sort, setSort] = useState("new");

  return (
    <Section id="overlays" eyebrow="Layers" title="Sheet and dialog">
      <Specimen
        label="Sheet"
        note="Responsive is a bottom sheet below 768px and a right drawer above. Escape, the close button, or a click outside dismisses."
      >
        <div className="flex flex-wrap gap-3">
          {sheetDemos.map((demo) => (
            <Button key={demo.side} variant="ghost" onClick={() => setSheet(demo.side)}>
              {demo.label}
            </Button>
          ))}
        </div>
      </Specimen>

      <Specimen label="Dialog" note="Centred, for confirmations and short forms.">
        <div>
          <Button onClick={() => setDialog(true)}>Open dialog</Button>
        </div>
      </Specimen>

      <Sheet
        open={sheet !== null}
        onOpenChange={(open) => !open && setSheet(null)}
        side={sheet ?? "responsive"}
        title="Filters"
        description="Narrow by fabric and sort order."
        footer={
          <>
            <Button variant="ghost" onClick={() => setSheet(null)}>
              Clear
            </Button>
            <Button onClick={() => setSheet(null)}>Show 128 pieces</Button>
          </>
        }
      >
        <div className="flex flex-col gap-6">
          <RadioGroup legend="Sort by" name="sheet-sort" options={sorts} value={sort} onValueChange={setSort} />
          <fieldset>
            <legend className="mb-1 text-sm font-medium text-ink">Fabric</legend>
            {fabrics.map((fabric) => (
              <Checkbox key={fabric} label={fabric} />
            ))}
          </fieldset>
          <p className="caption">
            Long content scrolls inside the sheet while the header and footer stay pinned. Filler
            follows to prove it.
          </p>
          {Array.from({ length: 6 }, (_, i) => (
            <Checkbox key={i} label={`Colour option ${i + 1}`} />
          ))}
        </div>
      </Sheet>

      <Dialog
        open={dialog}
        onOpenChange={setDialog}
        title="Remove from bag?"
        description="You can save it to your wishlist instead."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDialog(false)}>
              Keep it
            </Button>
            <Button
              onClick={() => {
                setDialog(false);
                toast.success("Removed from your bag");
              }}
            >
              Remove
            </Button>
          </>
        }
      >
        <p className="body">Linen Camp Shirt, Indigo, size M. Rs 2,199.</p>
      </Dialog>
    </Section>
  );
}
