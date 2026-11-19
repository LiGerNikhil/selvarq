"use client";

import Link from "next/link";
import { useRef, useState, type UIEvent } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { MediaImage } from "@/components/ui/media-image";
import { scrollBehavior } from "@/lib/motion";
import type { Banner } from "@/data";

export function EditorialHero({ banners }: { banners: Banner[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Until a banner is added in the admin panel, show a brand-led hero rather
  // than an empty carousel.
  if (!banners.length) {
    return (
      <section aria-label="SELVARQ" className="bg-indigo-deep">
        <div className="page-container flex min-h-[34rem] items-end pb-16 pt-12 md:min-h-[42rem] md:items-center md:pb-20">
          <div className="max-w-2xl text-ivory">
            <p className="eyebrow text-gold-soft">An edit by SELVARQ</p>
            <h1 className="mt-4 font-display text-5xl leading-[0.98] tracking-[0.06em] sm:text-6xl md:text-7xl">Considered Indian clothing</h1>
            <p className="mt-4 max-w-lg text-base text-ivory/90 md:text-lg">Handloom textures, considered details and pieces made to last — from SELVARQ and independent makers.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/shop" variant="primary" className="border border-gold bg-indigo text-ivory hover:bg-indigo-deep">Shop all clothing</ButtonLink>
              <ButtonLink href="/about" variant="ghost" className="border-ivory text-ivory hover:bg-ivory/10">Our story</ButtonLink>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function onScroll(event: UIEvent<HTMLDivElement>) {
    const rail = event.currentTarget;
    const slideWidth = rail.clientWidth;
    if (slideWidth) setActive(Math.round(rail.scrollLeft / slideWidth));
  }

  function goTo(index: number) {
    const slide = railRef.current?.children.item(index);
    slide?.scrollIntoView({ behavior: scrollBehavior(), block: "nearest", inline: "start" });
    setActive(index);
  }

  return (
    <section aria-label="Featured collections" className="relative">
      <div ref={railRef} onScroll={onScroll} tabIndex={0} role="region" aria-label="Featured collection slides" className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {banners.map((banner, index) => {
          const Heading = index === 0 ? "h1" : "h2";
          return (
            <article key={banner.id} className="relative w-full shrink-0 snap-start">
            <div className="relative min-h-[34rem] md:min-h-[42rem]">
              <MediaImage
                src={banner.imageId}
                alt={`${banner.title}: ${banner.subtitle}`}
                ratio="16/9"
                sizes="100vw"
                preload={index === 0}
                className="absolute inset-0 h-full"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-indigo-deep/70 via-indigo-deep/20 to-transparent" />
              <div className="page-container relative flex min-h-[34rem] items-end pb-16 pt-12 md:min-h-[42rem] md:items-center md:pb-20">
                <div className="max-w-2xl text-ivory">
                  <p className="eyebrow text-gold-soft">An edit by SELVARQ</p>
                  <Heading className="mt-4 font-display text-5xl leading-[0.98] tracking-[0.06em] sm:text-6xl md:text-7xl">{banner.title}</Heading>
                  <p className="mt-4 max-w-lg text-base text-ivory/90 md:text-lg">{banner.subtitle}</p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <ButtonLink href={banner.href} variant="primary" className="border border-gold bg-indigo text-ivory hover:bg-indigo-deep">
                      Explore the edit
                    </ButtonLink>
                    <ButtonLink href="/shop" variant="ghost" className="border-ivory text-ivory hover:bg-ivory/10">
                      Shop all clothing
                    </ButtonLink>
                  </div>
                </div>
              </div>
            </div>
            </article>
          );
        })}
      </div>
      <div className="absolute bottom-4 right-4 flex items-center gap-2 md:bottom-7 md:right-8">
        <button type="button" onClick={() => goTo((active - 1 + banners.length) % banners.length)} aria-label="Previous feature" className="grid size-11 place-items-center border border-ivory/60 bg-indigo-deep/40 text-ivory backdrop-blur hover:bg-indigo-deep/70">
          <ArrowLeft aria-hidden className="size-4" />
        </button>
        <div className="flex gap-1" role="group" aria-label="Choose a featured collection">
          {banners.map((banner, index) => (
            <button key={banner.id} type="button" onClick={() => goTo(index)} aria-label={`Show ${banner.title}`} aria-current={active === index ? "true" : undefined} className="group grid size-6 place-items-center">
              <span aria-hidden className={`h-1 w-6 transition-colors ${active === index ? "bg-gold-soft" : "bg-ivory/50 group-hover:bg-ivory/80"}`} />
            </button>
          ))}
        </div>
        <button type="button" onClick={() => goTo((active + 1) % banners.length)} aria-label="Next feature" className="grid size-11 place-items-center border border-ivory/60 bg-indigo-deep/40 text-ivory backdrop-blur hover:bg-indigo-deep/70">
          <ArrowRight aria-hidden className="size-4" />
        </button>
      </div>
      <Link href="/shop" className="sr-only">Browse all collections</Link>
    </section>
  );
}
