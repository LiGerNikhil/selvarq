"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  BadgePercent,
  Boxes,
  CircleDollarSign,
  CreditCard,
  Flag,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
  Store,
  Tags,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const sections = [
  {
    label: "Overview",
    links: [{ title: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "Marketplace",
    links: [
      { title: "Merchants", href: "/admin/merchants", icon: Store },
      { title: "Commissions", href: "/admin/commissions", icon: BadgePercent },
      { title: "Moderation", href: "/admin/moderation", icon: Flag },
      { title: "Products", href: "/admin/products", icon: Boxes },
      { title: "Catalog", href: "/admin/catalog", icon: Tags },
      { title: "Content", href: "/admin/content", icon: ShoppingBag },
    ],
  },
  {
    label: "Commerce",
    links: [
      { title: "Orders", href: "/admin/orders", icon: Package },
      { title: "Payouts", href: "/admin/payouts", icon: CircleDollarSign },
      { title: "Coupons", href: "/admin/coupons", icon: CreditCard },
      { title: "Reviews", href: "/admin/reviews", icon: MessageSquare },
      { title: "Customers", href: "/admin/users", icon: Users },
    ],
  },
  {
    label: "Platform",
    links: [{ title: "Settings", href: "/admin/settings", icon: Settings }],
  },
];

export function AdminShell({ name, children }: { name: string; children: ReactNode }) {
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
      console.error("Could not clear the demo admin session.", reason);
      setError("We could not sign you out. Please try again.");
    }
  }

  return (
    <main className="page-container py-7 md:py-10">
      <header className="mb-7 flex items-center justify-between gap-3 border-b border-line pb-5">
        <div>
          <p className="eyebrow">SELVARQ operations</p>
          <h1 className="display-md mt-1 text-indigo">Admin studio</h1>
          <p className="caption mt-1">{name} · demo workspace</p>
        </div>
        <Button variant="ghost" className="md:hidden" onClick={() => setMenuOpen(true)}>
          Admin menu
        </Button>
        <Button variant="quiet" className="hidden md:inline-flex" onClick={signOut}>
          <LogOut aria-hidden className="mr-2 size-4" />
          Sign out
        </Button>
      </header>
      {error ? <p role="alert" className="mb-4 text-sm text-danger">{error}</p> : null}
      <div className="grid items-start gap-7 md:grid-cols-[14rem_minmax(0,1fr)]">
        <aside className="hidden border border-line bg-ivory p-3 md:block">
          <AdminNavigation pathname={pathname} />
        </aside>
        <section className="min-w-0">{children}</section>
      </div>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen} title="Admin studio" side="bottom">
        <p className="mb-3 text-sm font-medium">{name}</p>
        <AdminNavigation pathname={pathname} onNavigate={() => setMenuOpen(false)} />
        <Button variant="ghost" fullWidth className="mt-3" onClick={signOut}>
          Sign out
        </Button>
      </Sheet>
    </main>
  );
}

function AdminNavigation({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Admin studio" className="space-y-4">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="px-3 pb-1 text-[11px] uppercase tracking-[0.16em] text-muted">{section.label}</p>
          <div className="space-y-0.5">
            {section.links.map(({ title, href, icon: Icon }) => {
              const active = href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-10 items-center gap-3 px-3 text-sm transition-colors hover:bg-pearl",
                    active ? "bg-pearl font-medium text-indigo" : "text-muted",
                  )}
                >
                  <Icon aria-hidden className="size-4 shrink-0" />
                  {title}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}