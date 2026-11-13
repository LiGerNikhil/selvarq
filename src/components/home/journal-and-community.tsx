import Link from "next/link";
import { ArrowUpRight, Instagram } from "lucide-react";
import { MediaImage } from "@/components/ui/media-image";
import type { Story } from "@/data";
import { instagramTiles } from "@/data";
import { SectionHeading } from "./category-tiles";

export function JournalTeaser({ stories }: { stories: Story[] }) {
  return (
    <section className="bg-pearl py-16 md:py-24">
      <div className="page-container">
        <SectionHeading eyebrow="Notes on cloth, craft and care" title="The style journal" href="/stories" linkText="Read all stories" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <article key={story.id} className="group">
              <Link href={`/stories/${story.slug}`} className="block overflow-hidden">
                <MediaImage src={story.imageId} alt={story.title} ratio="4/5" sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw" className="transition-transform duration-500 group-hover:scale-[1.025]" />
              </Link>
              <p className="eyebrow mt-4">{story.tags[0] ?? "From the journal"}</p>
              <h3 className="mt-2 font-display text-2xl text-indigo"><Link href={`/stories/${story.slug}`} className="hover:underline hover:decoration-gold hover:underline-offset-4">{story.title}</Link></h3>
              <p className="mt-2 text-sm leading-6 text-muted">{story.excerpt}</p>
              <Link href={`/stories/${story.slug}`} className="mt-3 inline-flex min-h-10 items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-indigo">Read story <ArrowUpRight aria-hidden className="size-4" /></Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CommunityGrid() {
  return (
    <section className="page-container py-16 md:py-24">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">A life well worn</p>
          <h2 className="display-md mt-2 text-indigo">A little more SELVARQ</h2>
        </div>
        <Link href="https://www.instagram.com/" className="inline-flex min-h-11 items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-indigo underline decoration-gold underline-offset-4">
          <Instagram aria-hidden className="size-4" /> Follow along
        </Link>
      </div>
      <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
        {instagramTiles.map((tile) => (
          <Link key={tile.imageId} href="https://www.instagram.com/" className="group relative overflow-hidden">
            <MediaImage src={tile.imageId} alt={tile.alt} ratio="1/1" sizes="(min-width: 640px) 24vw, 48vw" className="transition-transform duration-500 group-hover:scale-[1.04]" />
            <span className="absolute inset-0 flex items-end bg-gradient-to-t from-indigo-deep/65 to-transparent p-3 text-xs text-ivory opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">{tile.caption}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
