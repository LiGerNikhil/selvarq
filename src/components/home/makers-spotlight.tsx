import Link from "next/link";
import { ArrowUpRight, MapPin, Star } from "lucide-react";
import { MediaImage } from "@/components/ui/media-image";
import type { Merchant } from "@/data";

export function MakersSpotlight({ merchants }: { merchants: Merchant[] }) {
  return (
    <section className="bg-indigo-deep py-16 text-ivory md:py-24">
      <div className="page-container">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="eyebrow text-gold-soft">Good work has a name</p>
            <h2 className="display-md mt-3 text-ivory">Meet the makers</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-ivory/75">Independent Indian labels bring their own point of view, craft and care to the SELVARQ edit.</p>
          </div>
          <Link href="/shop" className="inline-flex min-h-11 items-center gap-2 text-xs font-medium uppercase tracking-[0.13em] text-ivory underline decoration-gold underline-offset-4">Discover their work <ArrowUpRight aria-hidden className="size-4" /></Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {merchants.map((merchant) => (
            <article key={merchant.id} className="border border-ivory/15 bg-ivory/[0.04] p-3 sm:p-4">
              <MediaImage src={merchant.logoId} alt={`${merchant.name} studio`} ratio="1/1" sizes="(min-width: 768px) 22vw, 45vw" />
              <h3 className="mt-4 font-display text-xl sm:text-2xl">{merchant.name}</h3>
              <p className="mt-2 line-clamp-3 min-h-[4.5rem] text-xs leading-5 text-ivory/70">{merchant.bio}</p>
              <div className="mt-3 flex items-center justify-between gap-2 text-xs text-ivory/80">
                <span className="inline-flex items-center gap-1"><MapPin aria-hidden className="size-3.5 text-gold-soft" />{merchant.city}</span>
                <span className="inline-flex items-center gap-1"><Star aria-hidden className="size-3.5 fill-gold-soft text-gold-soft" />{merchant.rating.average.toFixed(1)}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
