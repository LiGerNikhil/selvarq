import type { Metadata } from "next";
import { Logo } from "@/components/ui/logo";
import { ButtonsSection } from "./_sections/buttons";
import { CommerceSection } from "./_sections/commerce";
import { FeedbackSection } from "./_sections/feedback";
import { FormsSection } from "./_sections/forms";
import { NavigationSection } from "./_sections/navigation";
import { OverlaysSection } from "./_sections/overlays";
import { TokensSection } from "./_sections/tokens";

export const metadata: Metadata = {
  title: "Style guide",
  robots: { index: false, follow: false },
};

const links = [
  ["tokens", "Colour and type"],
  ["buttons", "Buttons"],
  ["forms", "Forms"],
  ["feedback", "Status"],
  ["overlays", "Layers"],
  ["navigation", "Wayfinding"],
  ["commerce", "Storefront"],
] as const;

export default function StyleguidePage() {
  return (
    <main className="page-container pb-24 pt-8 md:pt-12">
      <header className="flex flex-col gap-6 pb-10">
        <Logo href="/" />
        <div className="flex flex-col gap-3">
          <p className="eyebrow">Design system</p>
          <h1 className="display-lg text-indigo">Style guide</h1>
          <p className="body max-w-prose text-muted">
            Every primitive in its states. Resize from 360px up, and tab through it with a keyboard.
          </p>
        </div>
        <nav aria-label="Style guide sections" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0">
          <ul className="flex gap-6 whitespace-nowrap">
            {links.map(([id, label]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="inline-flex min-h-11 items-center text-xs font-medium uppercase tracking-[0.14em] text-indigo underline-offset-4 hover:underline"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <TokensSection />
      <ButtonsSection />
      <FormsSection />
      <FeedbackSection />
      <OverlaysSection />
      <NavigationSection />
      <CommerceSection />
    </main>
  );
}
