import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MediaImage } from "@/components/ui/media-image";
import type { BrandStoryChapter } from "@/data/stories";

export function BrandStory({ chapters }: { chapters: BrandStoryChapter[] }) {
  return (
    <section aria-labelledby="brand-story-title" className="bg-pearl py-16 md:py-24">
      <div className="page-container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Considered at every step</p>
          <h2 id="brand-story-title" className="display-lg mt-3 text-indigo">The SELVARQ Story</h2>
          <p className="body mx-auto mt-4 max-w-xl text-muted">Clothing is more than what we put on. It is the cloth we choose, the hands that shape it and the care that lets it stay with us.</p>
        </div>
        <div className="mt-12 space-y-14 md:mt-20 md:space-y-24">
          {chapters.map((chapter, index) => (
            <article key={chapter.id} className={`story-reveal grid items-center gap-8 md:grid-cols-2 md:gap-16 ${index % 2 ? "md:[&>div:first-child]:order-2" : ""}`}>
              <MediaImage src={chapter.imageId} alt={chapter.imageAlt} ratio="4/5" sizes="(min-width: 768px) 42vw, 100vw" />
              <div className="max-w-xl">
                <p className="eyebrow">{chapter.chapter}</p>
                <h3 className="display-md mt-3 text-indigo">{chapter.title}</h3>
                <p className="body mt-5 text-muted">{chapter.body}</p>
                <blockquote className="my-7 border-l border-gold pl-5 font-display text-2xl italic leading-snug text-indigo md:text-3xl">
                  “{chapter.pullQuote}”
                </blockquote>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/about" className="inline-flex min-h-11 items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-indigo underline decoration-gold underline-offset-4">
            Read our story <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
