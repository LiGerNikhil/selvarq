"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { MediaImage } from "@/components/ui/media-image";
import { scrollBehavior } from "@/lib/motion";
import type { Collection } from "@/data";

export function CollectionCarousel({ collections }: { collections: Collection[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const move = (direction: number) => railRef.current?.scrollBy({ left: direction * railRef.current.clientWidth * 0.8, behavior: scrollBehavior() });

  return (
    <section className="page-container py-16 md:py-24">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Chosen with intention</p>
          <h2 className="display-md mt-2 text-indigo">Curated collections</h2>
        </div>
        <div className="hidden gap-2 sm:flex">
          <button type="button" onClick={() => move(-1)} aria-label="Scroll collections left" className="grid size-11 place-items-center border border-line text-indigo hover:border-gold"><ArrowLeft aria-hidden className="size-4" /></button>
          <button type="button" onClick={() => move(1)} aria-label="Scroll collections right" className="grid size-11 place-items-center border border-line text-indigo hover:border-gold"><ArrowRight aria-hidden className="size-4" /></button>
        </div>
      </div>
      <div ref={railRef} tabIndex={0} role="region" aria-label="Curated collection slides" className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold motion-reduce:scroll-auto [scrollbar-width:thin] [scrollbar-color:var(--gold)_transparent]">
        {collections.map((collection) => (
          <Link key={collection.id} href={`/collection/${collection.slug}`} className="group w-[78%] shrink-0 snap-start sm:w-[46%] lg:w-[31%]">
            <div className="relative overflow-hidden">
              <MediaImage src={collection.imageId} alt={collection.name} ratio="4/5" sizes="(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 78vw" className="transition-transform duration-500 group-hover:scale-[1.03]" />
              <span className="absolute inset-0 bg-gradient-to-t from-indigo-deep/70 via-transparent to-transparent" />
              <span className="absolute inset-x-0 bottom-0 p-5 text-ivory">
                <span className="block font-display text-3xl">{collection.name}</span>
                <span className="mt-1 block max-w-sm text-sm text-ivory/85">{collection.description}</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
