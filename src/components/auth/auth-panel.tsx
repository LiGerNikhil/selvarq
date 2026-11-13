import type { ReactNode } from "react";

export function AuthPanel({ eyebrow, title, description, children }: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="page-container py-12 md:py-20">
      <section className="mx-auto max-w-lg border border-line bg-ivory p-5 sm:p-8 md:p-10">
        <p className="eyebrow mb-2">{eyebrow}</p>
        <h1 className="display-lg text-indigo">{title}</h1>
        <p className="mb-7 mt-3 text-sm text-muted">{description}</p>
        {children}
      </section>
    </main>
  );
}
