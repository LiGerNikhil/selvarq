import { BadgeCheck, CreditCard, RotateCcw, Truck } from "lucide-react";
import { homepagePromises } from "@/data";

const icons = { delivery: Truck, returns: RotateCcw, payments: CreditCard, makers: BadgeCheck };

export function TrustStrip() {
  return (
    <section aria-label="Shopping promises" className="border-b border-line bg-ivory">
      <div className="page-container grid grid-cols-2 divide-x divide-line py-4 sm:grid-cols-4">
        {homepagePromises.map(({ title, detail, icon }) => {
          const Icon = icons[icon];
          return (
          <div key={title} className="flex min-h-16 items-center justify-center gap-2 px-2 py-2 sm:gap-3">
            <Icon aria-hidden className="size-5 shrink-0 text-gold-ink" />
            <div>
              <p className="text-xs font-medium text-indigo">{title}</p>
              <p className="hidden text-[11px] leading-4 text-muted sm:block">{detail}</p>
            </div>
          </div>
          );
        })}
      </div>
    </section>
  );
}
