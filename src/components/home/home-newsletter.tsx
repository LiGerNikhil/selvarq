"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { homepageNewsletter } from "@/data";
import { toast } from "@/store/toast-store";

export function HomeNewsletter() {
  const [email, setEmail] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    toast.info("Newsletter signup is coming soon", { description: "We will be in touch when our mailing list opens." });
    setEmail("");
  }

  return (
    <section className="bg-indigo-deep py-14 text-ivory md:py-20">
      <div className="page-container grid gap-8 md:grid-cols-[1fr_1fr] md:items-end">
        <div>
          <p className="eyebrow text-gold-soft">{homepageNewsletter.eyebrow}</p>
          <h2 className="display-md mt-3 text-ivory">{homepageNewsletter.title}</h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-ivory/75">{homepageNewsletter.description}</p>
        </div>
        <form onSubmit={submit} className="flex border-b border-gold">
          <label htmlFor="home-newsletter-email" className="sr-only">{homepageNewsletter.inputLabel}</label>
          <input
            id="home-newsletter-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={homepageNewsletter.placeholder}
            className="min-h-12 min-w-0 flex-1 bg-transparent px-1 text-sm text-ivory outline-none placeholder:text-ivory/55"
          />
          <button type="submit" className="inline-flex min-h-12 items-center gap-2 px-3 text-xs font-medium uppercase tracking-[0.13em] text-ivory hover:text-gold-soft">
            {homepageNewsletter.action} <ArrowRight aria-hidden className="size-4" />
          </button>
        </form>
      </div>
    </section>
  );
}
