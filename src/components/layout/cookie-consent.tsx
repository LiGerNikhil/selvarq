"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { X } from "lucide-react";

const CONSENT_KEY = "selvarq-cookie-consent";
const CONSENT_EVENT = "selvarq:consent-change";

function subscribeConsent(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(CONSENT_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CONSENT_EVENT, callback);
  };
}

export function CookieConsent() {
  const visible = useSyncExternalStore(
    subscribeConsent,
    () => localStorage.getItem(CONSENT_KEY) === null,
    () => false,
  );

  const choose = (choice: "all" | "necessary") => {
    localStorage.setItem(CONSENT_KEY, choice);
    window.dispatchEvent(new Event(CONSENT_EVENT));
  };
  if (!visible) return null;

  return (
    <aside aria-label="Cookie preferences" className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+4.75rem)] z-40 mx-auto max-w-3xl border border-line bg-ivory p-4 shadow-float md:bottom-4 md:flex md:items-center md:gap-6 md:p-5">
      <div className="flex-1 pr-8 md:pr-0">
        <h2 className="text-sm font-medium text-ink">Your privacy matters</h2>
        <p className="mt-1 text-xs leading-5 text-muted">We use essential storage for site features. You can choose whether to allow optional cookies. <Link href="/privacy" className="text-indigo underline underline-offset-2">Read our privacy notice</Link>.</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 md:mt-0">
        <button type="button" onClick={() => choose("necessary")} className="min-h-11 border border-indigo px-3 text-xs font-medium text-indigo hover:bg-pearl">Necessary only</button>
        <button type="button" onClick={() => choose("all")} className="min-h-11 bg-indigo px-3 text-xs font-medium text-ivory hover:bg-indigo-deep">Accept all</button>
      </div>
      <button type="button" aria-label="Dismiss cookie notice" onClick={() => choose("necessary")} className="absolute right-1 top-1 grid size-11 place-items-center text-muted hover:text-indigo md:hidden"><X aria-hidden className="size-4" /></button>
    </aside>
  );
}
