"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, House, Search, ShoppingBag, UserRound } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";
import { useDemoAccount } from "@/hooks/use-demo-account";

const tabs = [
  { label: "Home", href: "/", icon: House },
  { label: "Search", href: null, icon: Search },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
  { label: "Bag", href: null, icon: ShoppingBag },
  { label: "Account", href: "/login", icon: UserRound },
] as const;

export function MobileTabBar() {
  const pathname = usePathname();
  const account = useDemoAccount();
  const setSearchOpen = useUIStore((state) => state.setSearchOpen);
  const setCartOpen = useUIStore((state) => state.setCartOpen);
  return (
    <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ivory/95 pb-safe backdrop-blur md:hidden">
      <ul className="grid min-h-14 grid-cols-5">
        {tabs.map(({ label, href: baseHref, icon: Icon }) => {
          const href = label === "Account" && account?.role === "customer" ? "/account" : baseHref;
          const active = href ? pathname === href || (href !== "/" && pathname.startsWith(href)) : false;
          const content = <><Icon aria-hidden className="size-5" /><span className="text-[11px] leading-none">{label}</span></>;
          const className = cn("flex min-h-14 flex-col items-center justify-center gap-1 text-muted transition-colors hover:text-indigo", active && "text-indigo");
          return (
            <li key={label}>
              {href ? (
                <Link href={href} aria-current={active ? "page" : undefined} className={className}>{content}</Link>
              ) : (
                <button type="button" className={cn("w-full", className)} onClick={() => label === "Search" ? setSearchOpen(true) : setCartOpen(true)}>{content}</button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
