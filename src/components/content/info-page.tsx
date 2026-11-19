import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import type { Crumb } from "@/components/ui/breadcrumbs";

export interface InfoSection {
  id: string;
  title: string;
  body: ReactNode;
}

export function InfoPage({
  title,
  eyebrow,
  intro,
  sections,
  crumbs,
  updated,
  children,
}: {
  title: string;
  eyebrow: string;
  intro: string;
  sections: InfoSection[];
  crumbs: Crumb[];
  updated?: string;
  children?: ReactNode;
}) {
  return (
    <main className="page-container py-8 md:py-12">
      <JsonLd data={breadcrumbJsonLd(crumbs.map((crumb) => ({ name: crumb.label, path: crumb.href })))} />
      <Breadcrumbs items={crumbs} className="mb-6" />
      <header className="max-w-3xl border-b border-line pb-6">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display-lg mt-2 text-indigo">{title}</h1>
        <p className="body mt-3 text-muted">{intro}</p>
        {updated ? <p className="caption mt-3">Last reviewed {updated}</p> : null}
      </header>
      {children}
      <div className="mt-8 grid gap-8 md:grid-cols-[12rem_minmax(0,1fr)]">
        <nav aria-label="On this page" className="hidden md:block">
          <p className="eyebrow mb-3">On this page</p>
          <ol className="space-y-1 text-sm text-muted">
            {sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="inline-flex min-h-9 items-center underline-offset-4 hover:text-indigo hover:underline">{section.title}</a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="min-w-0 space-y-8">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-6">
              <h2 className="font-display text-xl uppercase tracking-display text-indigo">{section.title}</h2>
              <div className="body mt-3 space-y-3 text-muted">{section.body}</div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
