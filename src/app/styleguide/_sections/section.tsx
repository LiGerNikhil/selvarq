import type { ReactNode } from "react";

/** Titled block used by every styleguide section. */
export function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-6 border-t border-gold/60 py-10 md:py-14">
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={`${id}-title`} className="display-md mt-2 text-indigo">
        {title}
      </h2>
      <div className="mt-8 flex flex-col gap-10">{children}</div>
    </section>
  );
}

/** Labelled example. `note` records what state is shown. */
export function Specimen({
  label,
  note,
  children,
}: {
  label: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="font-sans text-sm font-medium text-ink">{label}</h3>
        {note ? <p className="caption">{note}</p> : null}
      </div>
      {children}
    </div>
  );
}
