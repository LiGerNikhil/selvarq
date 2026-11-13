"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, type FormEvent } from "react";
import { Instagram, Mail, ShieldCheck, Truck, Undo2 } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/config";
import { toast } from "@/store/toast-store";

const linkGroups = [
  { title: "Discover", links: [["Shop all", "/shop"], ["Our stories", "/stories"], ["About SELVARQ", "/about"], ["Become a seller", "/sell"]] },
  { title: "Help", links: [["Contact us", "/contact"], ["Shipping", "/shipping"], ["Returns", "/returns"], ["FAQs", "/faq"]] },
  { title: "Your account", links: [["Sign in", "/login"], ["Your orders", "/account/orders"], ["Wishlist", "/wishlist"], ["Track an order", "/track"]] },
] as const;

export function SiteFooter() {
  const [email, setEmail] = useState("");
  function submitNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    toast.info("Newsletter signup is coming soon", { description: "We will be in touch when our mailing list opens." });
    setEmail("");
  }

  return (
    <footer className="border-t border-line bg-pearl pb-16 md:pb-0">
      <div className="page-container">
        <div className="grid gap-10 py-12 md:grid-cols-[1.4fr_2fr] md:py-16">
          <div className="max-w-md">
            <Logo href="/" size="lg" />
            <p className="mt-5 max-w-sm text-sm leading-6 text-muted">Considered Indian clothing, made by makers and chosen for the way you live.</p>
            <form onSubmit={submitNewsletter} className="mt-6">
              <label htmlFor="newsletter-email" className="eyebrow mb-2 block">Notes from SELVARQ</label>
              <div className="flex border-b border-indigo">
                <Mail aria-hidden className="my-auto mr-2 size-4 shrink-0 text-gold-ink" />
                <input id="newsletter-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" className="min-h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted" />
                <Button type="submit" variant="quiet" className="px-2 text-[11px]">Join</Button>
              </div>
              <p className="caption mt-2">Occasional stories, new collections and notes on craft.</p>
            </form>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            {linkGroups.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h2 className="eyebrow mb-3">{group.title}</h2>
                <ul className="space-y-1">
                  {group.links.map(([label, href]) => (
                    <li key={label}><Link href={href} className="inline-flex min-h-10 items-center text-sm text-muted transition-colors hover:text-indigo">{label}</Link></li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="grid gap-5 border-y border-line py-6 sm:grid-cols-3">
          <TrustItem icon={<Truck aria-hidden className="size-5" />} title="Thoughtful delivery" text="Tracked across India" />
          <TrustItem icon={<Undo2 aria-hidden className="size-5" />} title="Easy returns" text="7 days on eligible pieces" />
          <TrustItem icon={<ShieldCheck aria-hidden className="size-5" />} title="Secure checkout" text="Protected payment options" />
        </div>

        <div className="flex flex-col gap-4 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <span className="font-medium text-ink">We accept</span>
            <div className="grid grid-cols-3 items-center gap-x-3 gap-y-3 sm:flex sm:flex-wrap sm:gap-x-4">
              <PaymentMark src="/brand/upi.png" alt="UPI" className="w-12" />
              <PaymentMark src="/brand/VISA.png" alt="Visa" className="w-10" />
              <PaymentMark src="/brand/mastercard.png" alt="Mastercard" className="w-7" />
              <PaymentMark src="/brand/rupay.png" alt="RuPay" className="w-12" />
              <PaymentMark src="/brand/net-banking.png" alt="Net banking" className="w-[4.5rem]" />
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <Link href="/privacy" className="min-h-10 inline-flex items-center hover:text-indigo">Privacy</Link>
            <Link href="/terms" className="min-h-10 inline-flex items-center hover:text-indigo">Terms</Link>
            <Link href="https://www.instagram.com/" aria-label="Instagram" className="grid size-10 place-items-center text-indigo hover:bg-ivory"><Instagram aria-hidden className="size-5" /></Link>
          </div>
        </div>
        <div className="flex flex-col gap-1 border-t border-line py-5 text-center text-xs text-muted sm:flex-row sm:justify-between sm:text-left">
          <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          <p>{BRAND.footerLine}</p>
        </div>
      </div>
    </footer>
  );
}

function PaymentMark({ src, alt, className }: { src: string; alt: string; className: string }) {
  return (
    <span className={`relative flex h-8 shrink-0 items-center justify-center ${className}`}>
      <Image src={src} alt={alt} fill sizes="100px" className="object-contain" />
    </span>
  );
}

function TrustItem({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center border border-gold/50 text-gold-ink">{icon}</span>
      <div><h3 className="text-sm font-medium text-ink">{title}</h3><p className="caption">{text}</p></div>
    </div>
  );
}
