"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";

const fallbackOffers = [
  { text: "Complimentary delivery on orders above Rs 1,999", href: "/shop" },
  { text: "Discover considered pieces from independent Indian makers", href: "/shop" },
  { text: "Easy returns within 7 days on eligible items", href: "/shipping" },
];

export function AnnouncementBar({ offers = fallbackOffers }: { offers?: { id?: string; text: string; href: string }[] }) {
  const [active, setActive] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || offers.length < 2) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % offers.length), 6000);
    return () => window.clearInterval(timer);
  }, [paused, offers.length]);

  if (dismissed || !offers.length) return null;
  const offer = offers[active] ?? offers[0]!;
  const move = (direction: number) => setActive((current) => (current + direction + offers.length) % offers.length);

  return (
    <div className="relative flex min-h-10 items-center justify-center bg-indigo-deep px-10 text-center text-xs text-ivory sm:px-20" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
    }}>
      <button type="button" onClick={() => move(-1)} aria-label="Previous offer" className="absolute left-2 hidden size-9 place-items-center rounded-ui hover:bg-white/10 sm:grid">
        <ChevronLeft aria-hidden className="size-4" />
      </button>
      <Link href={offer.href} className="line-clamp-2 py-2 leading-4 underline-offset-4 hover:underline sm:line-clamp-1 sm:leading-normal" aria-live="polite">
        {offer.text}
      </Link>
      <button type="button" onClick={() => move(1)} aria-label="Next offer" className="absolute right-10 hidden size-9 place-items-center rounded-ui hover:bg-white/10 sm:grid">
        <ChevronRight aria-hidden className="size-4" />
      </button>
      <button type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? "Resume offer rotation" : "Pause offer rotation"} className="absolute right-20 hidden size-9 place-items-center rounded-ui hover:bg-white/10 sm:grid">
        {paused ? <Play aria-hidden className="size-3.5" /> : <Pause aria-hidden className="size-3.5" />}
      </button>
      <button type="button" onClick={() => setDismissed(true)} aria-label="Dismiss offers" className="absolute right-1 grid size-9 place-items-center rounded-ui hover:bg-white/10">
        <X aria-hidden className="size-4" />
      </button>
    </div>
  );
}
