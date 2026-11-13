"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { BadgeCheck, Bell, Boxes, CircleDollarSign, LayoutDashboard, LogOut, Package, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const links = [
  { title: "Overview", href: "/merchant/dashboard", icon: LayoutDashboard },
  { title: "Products", href: "/merchant/products", icon: Boxes },
  { title: "Orders", href: "/merchant/orders", icon: Package },
  { title: "Payouts", href: "/merchant/payouts", icon: CircleDollarSign },
  { title: "Storefront", href: "/merchant/profile", icon: Store },
  { title: "Notifications", href: "/merchant/notifications", icon: Bell },
];

export function MerchantShell({ name, merchantId, children }: { name: string; merchantId: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error(`Sign-out failed with status ${response.status}.`);
      router.push("/login");
      router.refresh();
    } catch (reason) {
      console.error("Could not clear the demo merchant session.", reason);
      setError("We could not sign you out. Please try again.");
    }
  }

  return <main className="page-container py-7 md:py-12">
    <header className="mb-7 flex items-center justify-between gap-3 border-b border-line pb-5">
      <div><p className="eyebrow">Seller studio</p><h1 className="display-md mt-1 text-indigo">{name}</h1></div>
      <Button variant="ghost" className="md:hidden" onClick={() => setMenuOpen(true)}>Seller menu</Button>
      <Button variant="quiet" className="hidden md:inline-flex" onClick={signOut}><LogOut aria-hidden className="mr-2 size-4" />Sign out</Button>
    </header>
    {error ? <p role="alert" className="mb-4 text-sm text-danger">{error}</p> : null}
    <div className="grid items-start gap-7 md:grid-cols-[13rem_minmax(0,1fr)]">
      <aside className="hidden border border-line bg-ivory p-3 md:block">
        <p className="mb-3 flex items-center gap-2 px-3 text-xs text-muted"><BadgeCheck aria-hidden className="size-4 text-success" />Approved seller</p>
        <MerchantNavigation pathname={pathname} />
        <p className="mt-4 border-t border-line px-3 pt-3 text-xs text-muted">Store ID: {merchantId}</p>
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
    <Sheet open={menuOpen} onOpenChange={setMenuOpen} title="Seller studio" side="bottom">
      <p className="mb-3 text-sm font-medium">{name}</p><MerchantNavigation pathname={pathname} onNavigate={() => setMenuOpen(false)} /><Button variant="ghost" fullWidth className="mt-3" onClick={signOut}>Sign out</Button>
    </Sheet>
  </main>;
}

function MerchantNavigation({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return <nav aria-label="Seller studio" className="space-y-1">{links.map(({ title, href, icon: Icon }) => {
    const active = pathname === href || (href !== "/merchant/dashboard" && pathname.startsWith(`${href}/`));
    return <Link key={href} href={href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={cn("flex min-h-11 items-center gap-3 px-3 text-sm transition-colors hover:bg-pearl", active ? "bg-pearl font-medium text-indigo" : "text-muted")}><Icon aria-hidden className="size-4" />{title}</Link>;
  })}</nav>;
}
