"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronRight, Menu } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Sheet } from "@/components/ui/sheet";
import type { Category, Collection } from "@/data";

export function MobileMenu({ categories, collections }: { categories: Category[]; collections: Collection[] }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const roots = categories.filter((category) => category.parentId === null);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} className="grid size-10 place-items-center rounded-ui text-indigo hover:bg-pearl lg:hidden md:size-11">
        <Menu aria-hidden className="size-5" />
      </button>
      <Sheet open={open} onOpenChange={setOpen} title="Explore SELVARQ" side="left">
        <div className="mb-5 flex justify-center border-b border-line pb-5">
          <Logo href="/" />
        </div>
        <nav aria-label="Mobile menu" className="divide-y divide-line">
          {roots.map((root) => {
            const children = categories.filter((category) => category.parentId === root.id);
            const isExpanded = expanded === root.id;
            return (
              <section key={root.id}>
                <button type="button" onClick={() => setExpanded(isExpanded ? null : root.id)} aria-expanded={isExpanded} className="flex min-h-12 w-full items-center justify-between text-left text-sm font-medium text-indigo">
                  {root.name}
                  {isExpanded ? <ChevronDown aria-hidden className="size-4" /> : <ChevronRight aria-hidden className="size-4" />}
                </button>
                {isExpanded ? (
                  <ul className="pb-3 pl-3">
                    <li><MenuLink href={`/category/${root.slug}`} onClick={() => setOpen(false)}>Shop all {root.name}</MenuLink></li>
                    {children.map((category) => <li key={category.id}><MenuLink href={`/category/${category.slug}`} onClick={() => setOpen(false)}>{category.name}</MenuLink></li>)}
                  </ul>
                ) : null}
              </section>
            );
          })}
          <section className="py-3">
            <h3 className="eyebrow mb-2">Collections</h3>
            <ul>
              {collections.map((collection) => <li key={collection.id}><MenuLink href={`/collection/${collection.slug}`} onClick={() => setOpen(false)}>{collection.name}</MenuLink></li>)}
            </ul>
          </section>
        </nav>
        <div className="mt-4">
          <ButtonLink href="/sell" variant="ghost" fullWidth onClick={() => setOpen(false)}>Become a seller</ButtonLink>
        </div>
      </Sheet>
    </>
  );
}

function MenuLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return <Link href={href} onClick={onClick} className="flex min-h-11 items-center text-sm text-muted transition-colors hover:text-indigo">{children}</Link>;
}
