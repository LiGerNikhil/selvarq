"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Heart, Search, ShoppingBag, UserRound } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import type { Category, Collection } from "@/data";
import { selectCartCount, useCartStore } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { useDemoAccount } from "@/hooks/use-demo-account";
import { MobileMenu } from "./mobile-menu";
import { MiniCart } from "./mini-cart";
import { SearchOverlay } from "./search-overlay";

export interface HeaderProduct {
  id: string;
  name: string;
  slug: string;
  tags: string[];
}

export function SiteHeader({ categories, collections, products }: {
  categories: Category[];
  collections: Collection[];
  products: HeaderProduct[];
}) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const setSearchOpen = useUIStore((state) => state.setSearchOpen);
  const setCartOpen = useUIStore((state) => state.setCartOpen);
  const cartCount = useCartStore(selectCartCount);
  const mounted = useHydrated();
  const account = useDemoAccount();

  const roots = categories.filter((category) => category.parentId === null);
  const openMenu = (id: string) => setActiveMenu(id);
  const menuRoot = roots.find((root) => root.id === activeMenu);

  return (
    <>
      <header
        className="relative z-30 border-b border-line bg-ivory"
        onMouseLeave={() => setActiveMenu(null)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setActiveMenu(null);
        }}
        onBlur={(event) => {
          if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) setActiveMenu(null);
        }}
      >
        <div className="page-container">
          <div className="grid h-[4.75rem] grid-cols-[1fr_auto_1fr] items-center gap-1 md:relative md:flex md:h-[5.5rem] md:justify-between md:gap-2">
            <div className="flex items-center gap-0 md:gap-1">
              <MobileMenu categories={categories} collections={collections} />
              <button type="button" onClick={() => setSearchOpen(true)} aria-label="Search" className="grid size-10 place-items-center rounded-ui text-indigo hover:bg-pearl lg:hidden md:size-11">
                <Search aria-hidden className="size-5" />
              </button>
              <button type="button" onClick={() => setSearchOpen(true)} className="hidden min-h-11 items-center gap-2 text-sm text-muted hover:text-indigo lg:inline-flex" aria-label="Search products">
                <Search aria-hidden className="size-5" /> <span>Search</span>
              </button>
            </div>
            <div className="justify-self-center md:absolute md:left-1/2 md:-translate-x-1/2">
              <Logo href="/" size="md" className="max-w-[38vw] md:max-w-none" />
            </div>
            <div className="ml-auto flex items-center justify-self-end gap-0.5 md:ml-auto">
              <Link href="/wishlist" aria-label="Wishlist" className="hidden size-11 place-items-center rounded-ui text-indigo hover:bg-pearl md:grid">
                <Heart aria-hidden className="size-5" />
              </Link>
              <details className="group relative hidden md:block">
                <summary aria-label="Account menu" className="grid size-11 cursor-pointer list-none place-items-center rounded-ui text-indigo hover:bg-pearl [&::-webkit-details-marker]:hidden">
                  <UserRound aria-hidden className="size-5" />
                </summary>
                <div className="absolute right-0 top-full z-50 mt-2 w-56 border border-line bg-ivory p-2 shadow-float">
                  {account ? <>
                    <p className="eyebrow px-3 py-2">Hello, {account.name.split(" ")[0]}</p>
                    <HeaderLink href="/account">Account overview</HeaderLink>
                    <HeaderLink href="/account/orders">Your orders</HeaderLink>
                  </> : <>
                    <p className="eyebrow px-3 py-2">Your account</p>
                    <HeaderLink href="/login">Sign in</HeaderLink>
                    <HeaderLink href="/register">Create account</HeaderLink>
                    <HeaderLink href="/account/orders">Your orders</HeaderLink>
                  </>}
                </div>
              </details>
              <button type="button" onClick={() => setCartOpen(true)} aria-label={`Open bag${mounted && cartCount ? `, ${cartCount} items` : ""}`} className="relative grid size-10 place-items-center rounded-ui text-indigo hover:bg-pearl md:size-11">
                <ShoppingBag aria-hidden className="size-5" />
                {mounted && cartCount ? <span aria-hidden className="absolute right-0.5 top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-indigo px-1 text-[10px] leading-none text-ivory">{cartCount > 99 ? "99+" : cartCount}</span> : null}
              </button>
            </div>
          </div>

          <nav aria-label="Main menu" className="hidden h-12 items-stretch justify-center gap-1 border-t border-line lg:flex">
            {roots.map((root) => (
              <button key={root.id} type="button" onClick={() => openMenu(root.id)} onMouseEnter={() => setActiveMenu(root.id)} aria-expanded={activeMenu === root.id} className="inline-flex min-w-24 items-center justify-center gap-1 px-4 text-xs font-medium uppercase tracking-[0.12em] text-indigo hover:text-gold-ink">
                {root.name}<ChevronDown aria-hidden className="size-3" />
              </button>
            ))}
            <button type="button" onClick={() => openMenu("collections")} onMouseEnter={() => setActiveMenu("collections")} aria-expanded={activeMenu === "collections"} className="inline-flex min-w-32 items-center justify-center gap-1 px-4 text-xs font-medium uppercase tracking-[0.12em] text-indigo hover:text-gold-ink">
              Collections<ChevronDown aria-hidden className="size-3" />
            </button>
          </nav>
        </div>
        {activeMenu ? (
          <div className="absolute left-0 right-0 top-full border-t border-line bg-ivory shadow-float">
            <div className="page-container grid min-h-56 grid-cols-4 gap-8 py-8">
              {activeMenu === "collections" ? (
                <>
                  <div className="col-span-1">
                    <p className="eyebrow mb-3">The SELVARQ edit</p>
                    <h2 className="display-md text-indigo">Collections</h2>
                  </div>
                  <ul className="col-span-3 grid grid-cols-3 gap-x-8 gap-y-2">
                    {collections.map((collection) => <li key={collection.id}><HeaderLink href={`/collection/${collection.slug}`} onClick={() => setActiveMenu(null)}>{collection.name}</HeaderLink></li>)}
                  </ul>
                </>
              ) : menuRoot ? (
                <>
                  <div>
                    <p className="eyebrow mb-3">Shop by department</p>
                    <h2 className="display-md text-indigo">{menuRoot.name}</h2>
                    <Link href={`/category/${menuRoot.slug}`} onClick={() => setActiveMenu(null)} className="mt-5 inline-block text-sm text-indigo underline underline-offset-4">Shop all {menuRoot.name}</Link>
                  </div>
                  <ul className="col-span-3 grid grid-cols-3 gap-x-8 gap-y-2">
                    {categories.filter((category) => category.parentId === menuRoot.id).map((category) => (
                      <li key={category.id}><HeaderLink href={`/category/${category.slug}`} onClick={() => setActiveMenu(null)}>{category.name}</HeaderLink></li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          </div>
        ) : null}
      </header>
      <MiniCart />
      <SearchOverlay products={products} categories={categories} />
    </>
  );
}

function HeaderLink({ href, onClick, children }: { href: string; onClick?: () => void; children: React.ReactNode }) {
  return <Link href={href} onClick={onClick} className="flex min-h-11 items-center px-3 text-sm text-muted transition-colors hover:bg-pearl hover:text-indigo">{children}</Link>;
}
