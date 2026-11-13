import { Check, Scissors, Sparkles, SwatchBook } from "lucide-react";
import { craftSteps } from "@/data";

const icons = [SwatchBook, Scissors, Sparkles, Check];

export function CraftProcess() {
  return (
    <section className="bg-gold-soft/40 py-16 md:py-20">
      <div className="page-container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Care you can feel</p>
          <h2 className="display-md mt-3 text-indigo">From first thread to final check</h2>
        </div>
        <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {craftSteps.map((step, index) => {
            const Icon = icons[index] ?? Check;
            return (
              <li key={step.number} className="relative border-t border-gold/60 pt-5">
                <div className="flex items-center justify-between">
                  <span className="font-display text-3xl text-gold-ink">{step.number}</span>
                  <Icon aria-hidden className="size-5 text-indigo" />
                </div>
                <h3 className="mt-4 font-display text-2xl text-indigo">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{step.text}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
