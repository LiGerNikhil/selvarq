"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { copy } from "@/data/copy";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="page-container flex min-h-dvh flex-col items-center justify-center gap-6 py-16 text-center">
      <Logo />
      <div className="flex max-w-md flex-col gap-3">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="display-md text-indigo">We dropped a stitch</h1>
        <p className="body text-muted">{copy.errors.generic}</p>
        {error.digest ? <p className="caption">Reference: {error.digest}</p> : null}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="ghost">
          Back to home
        </ButtonLink>
      </div>
    </main>
  );
}
