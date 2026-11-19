import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="display-md mt-1 text-indigo">{title}</h2>
        {description ? <p className="body mt-2 max-w-2xl text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function StatCard({
  label,
  value,
  hint,
  href,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
  tone?: "default" | "attention" | "positive";
}) {
  const content = (
    <>
      <p className="text-xs uppercase tracking-[0.12em] text-muted">{label}</p>
      <p
        className={cn(
          "mt-2 font-display text-2xl leading-none",
          tone === "attention" ? "text-burgundy" : tone === "positive" ? "text-success" : "text-indigo",
        )}
      >
        {value}
      </p>
      {hint ? <p className="caption mt-2">{hint}</p> : null}
      {href ? <ArrowUpRight aria-hidden className="absolute right-4 top-4 size-4 text-muted" /> : null}
    </>
  );
  return href ? (
    <Link href={href} className="relative block border border-line bg-ivory p-4 transition-colors hover:border-indigo">
      {content}
    </Link>
  ) : (
    <div className="relative border border-line bg-ivory p-4">{content}</div>
  );
}

export function AdminSection({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border border-line bg-ivory">
      <div className="flex flex-col gap-2 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-medium text-indigo">{title}</h3>
          {description ? <p className="caption mt-1">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function EmptyAdminState({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-8 text-center">
      <p className="font-medium text-indigo">{title}</p>
      <p className="caption mx-auto mt-2 max-w-sm">{description}</p>
    </div>
  );
}