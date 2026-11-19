"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useSyncExternalStore, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock3, Search, X } from "lucide-react";
import type { Category } from "@/data";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";
import { useModalDialog } from "@/hooks/use-modal-dialog";

interface SearchProduct {
  id: string;
  name: string;
  slug: string;
  tags: string[];
}

const RECENT_KEY = "selvarq-recent-searches";
const RECENT_EVENT = "selvarq:recent-searches";

function recentSnapshot(): string {
  return localStorage.getItem(RECENT_KEY) ?? "[]";
}

function subscribeRecent(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(RECENT_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(RECENT_EVENT, callback);
  };
}

function parseRecent(snapshot: string): string[] {
  try {
    const value: unknown = JSON.parse(snapshot);
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").slice(0, 5) : [];
  } catch {
    return [];
  }
}

export function SearchOverlay({ products, categories }: { products: SearchProduct[]; categories: Category[] }) {
  const open = useUIStore((state) => state.searchOpen);
  const setOpen = useUIStore((state) => state.setSearchOpen);
  const [query, setQuery] = useState("");
  const recent = parseRecent(useSyncExternalStore(subscribeRecent, recentSnapshot, () => "[]"));
  const inputRef = useRef<HTMLInputElement>(null);
  const normalized = query.trim().toLocaleLowerCase("en-IN");
  const dialog = useModalDialog(open, setOpen);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  const productSuggestions = useMemo(() => normalized
    ? products.filter((product) => `${product.name} ${product.tags.join(" ")}`.toLocaleLowerCase("en-IN").includes(normalized)).slice(0, 5)
    : [], [normalized, products]);
  const categorySuggestions = useMemo(() => normalized
    ? categories.filter((category) => category.name.toLocaleLowerCase("en-IN").includes(normalized)).slice(0, 4)
    : [], [normalized, categories]);

  const remember = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const next = [trimmed, ...recent.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(RECENT_EVENT));
  };
  const searchHref = `/search?q=${encodeURIComponent(query.trim())}`;
  const close = () => setOpen(false);

  return (
    <dialog {...dialog} className="overlay" data-kind="search" aria-labelledby="search-title">
      <section className="max-h-[90dvh] w-full overflow-y-auto border-b border-line bg-ivory shadow-float">
        <div className="page-container">
          <div className="flex items-center gap-3 border-b border-line py-4">
            <Search aria-hidden className="size-5 shrink-0 text-gold-ink" />
            <h2 id="search-title" className="sr-only">Search SELVARQ</h2>
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && query.trim()) {
                  remember(query);
                  setOpen(false);
                  router.push(searchHref);
                }
              }}
              placeholder="Search clothing, fabric or occasion"
              aria-label="Search products and categories"
              className="min-h-12 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted"
            />
            {query ? <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="grid size-10 place-items-center"><X aria-hidden className="size-4" /></button> : null}
            <button type="button" onClick={close} aria-label="Close search" className="grid size-11 place-items-center rounded-ui text-indigo hover:bg-pearl"><X aria-hidden className="size-5" /></button>
          </div>
          <div className="grid gap-8 py-6 md:grid-cols-3">
            {normalized ? (
              <>
                <SuggestionGroup title="Products">
                  {productSuggestions.map((product) => (
                    <Link key={product.id} href={`/product/${product.slug}`} onClick={close} className="flex min-h-11 items-center justify-between gap-3 py-2 text-sm hover:text-indigo">
                      <span>{product.name}</span><ArrowRight aria-hidden className="size-4 shrink-0 text-gold-ink" />
                    </Link>
                  ))}
                  {!productSuggestions.length ? <p className="caption py-2">No matching products yet.</p> : null}
                </SuggestionGroup>
                <SuggestionGroup title="Categories">
                  {categorySuggestions.map((category) => (
                    <Link key={category.id} href={`/category/${category.slug}`} onClick={close} className="block min-h-11 py-2 text-sm hover:text-indigo">{category.name}</Link>
                  ))}
                  {!categorySuggestions.length ? <p className="caption py-2">No matching categories.</p> : null}
                </SuggestionGroup>
                <div>
                  <Link href={searchHref} onClick={() => { remember(query); close(); }} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-indigo underline underline-offset-4">
                    View all results for “{query.trim()}” <ArrowRight aria-hidden className="size-4" />
                  </Link>
                </div>
              </>
            ) : (
              <SuggestionGroup title="Recent searches" icon={<Clock3 aria-hidden className="size-4" />}>
                {recent.length ? recent.map((term) => (
                  <button key={term} type="button" onClick={() => setQuery(term)} className="block min-h-11 py-2 text-left text-sm hover:text-indigo">{term}</button>
                )) : <p className="caption py-2">Your recent searches will appear here.</p>}
                {recent.length ? <button type="button" onClick={() => { localStorage.removeItem(RECENT_KEY); window.dispatchEvent(new Event(RECENT_EVENT)); }} className="mt-2 min-h-11 text-xs text-muted underline underline-offset-4">Clear history</button> : null}
              </SuggestionGroup>
            )}
          </div>
        </div>
      </section>
    </dialog>
  );
}

function SuggestionGroup({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <h3 className={cn("eyebrow mb-2 flex items-center gap-2", icon && "text-gold-ink")}>{icon}{title}</h3>
      <div className="divide-y divide-line">{children}</div>
    </div>
  );
}
