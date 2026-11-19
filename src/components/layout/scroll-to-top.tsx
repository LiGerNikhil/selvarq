"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { scrollBehavior } from "@/lib/motion";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const update = () => setVisible(window.scrollY > 560);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  if (!visible) return null;
  return (
    <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: scrollBehavior() })} aria-label="Scroll to top" className="fixed bottom-20 right-4 z-20 grid size-11 place-items-center border border-gold bg-ivory text-indigo shadow-float transition-colors hover:bg-pearl md:bottom-6 md:right-6">
      <ArrowUp aria-hidden className="size-5" />
    </button>
  );
}
