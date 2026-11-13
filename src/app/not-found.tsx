import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { copy } from "@/data/copy";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="page-container flex min-h-dvh flex-col items-center justify-center gap-6 py-16 text-center">
      <Logo />
      <div className="flex max-w-md flex-col gap-3">
        <p className="eyebrow">Error 404</p>
        <h1 className="display-md text-indigo">{copy.notFound.title}</h1>
        <p className="body text-muted">{copy.notFound.body}</p>
      </div>
      <ButtonLink href="/">{copy.actions.continueShopping}</ButtonLink>
    </main>
  );
}
