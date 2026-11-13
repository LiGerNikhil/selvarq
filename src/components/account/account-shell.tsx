"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const links = [
  ["Overview", "/account"],
  ["Profile", "/account/profile"],
  ["Addresses", "/account/addresses"],
  ["Orders", "/account/orders"],
  ["Wishlist", "/account/wishlist"],
  ["Reviews", "/account/reviews"],
  ["Notifications", "/account/notifications"],
  ["Preferences", "/account/preferences"],
] as const;

export function AccountShell({ name, children }: { name: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  async function signOut() {
    setLogoutError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error(`Sign-out failed with status ${response.status}.`);
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Could not clear demo session.", error);
      setLogoutError("We could not sign you out. Please try again.");
    }
  }

  return (
    <main className="page-container py-8 md:py-14">
      <div className="mb-7 flex items-center justify-between gap-3">
        <div><p className="eyebrow">Your SELVARQ</p><h1 className="display-lg text-indigo">Account</h1></div>
        <Button variant="ghost" className="md:hidden" onClick={() => setMenuOpen(true)}>Account menu</Button>
        <Button variant="quiet" className="hidden md:inline-flex" onClick={signOut}>Sign out</Button>
      </div>
      {logoutError ? <p role="alert" className="mb-4 text-sm text-danger">{logoutError}</p> : null}
      <div className="grid items-start gap-8 md:grid-cols-[13rem_minmax(0,1fr)]">
        <aside className="hidden border border-line bg-ivory p-4 md:block">
          <p className="mb-3 text-sm font-medium text-ink">{name}</p>
          <nav aria-label="Account" className="space-y-1">
            {links.map(([label, href]) => <AccountLink key={href} href={href} active={pathname === href || (href !== "/account" && pathname.startsWith(`${href}/`))}>{label}</AccountLink>)}
          </nav>
          <Button variant="quiet" className="mt-3" onClick={signOut}>Sign out</Button>
        </aside>
        <section className="min-w-0">{children}</section>
      </div>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen} title="Your account" side="bottom">
        <p className="mb-3 text-sm font-medium text-ink">{name}</p>
        <nav aria-label="Mobile account menu" className="grid grid-cols-2 gap-1">
          {links.map(([label, href]) => <AccountLink key={href} href={href} active={pathname === href || (href !== "/account" && pathname.startsWith(`${href}/`))} onClick={() => setMenuOpen(false)}>{label}</AccountLink>)}
        </nav>
        <Button variant="ghost" fullWidth className="mt-3" onClick={signOut}>Sign out</Button>
      </Sheet>
    </main>
  );
}

function AccountLink({ href, active, onClick, children }: { href: string; active: boolean; onClick?: () => void; children: ReactNode }) {
  return <Link href={href} onClick={onClick} aria-current={active ? "page" : undefined} className={cn("flex min-h-11 items-center px-3 text-sm transition-colors hover:bg-pearl", active ? "bg-pearl font-medium text-indigo" : "text-muted")}>{children}</Link>;
}
