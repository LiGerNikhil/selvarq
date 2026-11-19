import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { MediaImage } from "@/components/ui/media-image";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import { storiesRepository } from "@/lib/repo";

export const metadata: Metadata = pageMetadata({
  title: "Stories",
  description: "Notes on cloth, craft and care from SELVARQ and the makers we work with.",
  path: "/stories",
});

// Journal entries come from the admin content store, so render per request.
export const dynamic = "force-dynamic";

export default async function StoriesPage() {
  const { items } = await storiesRepository.list({ pageSize: 50 });

  return (
    <main className="page-container py-8 md:py-12">
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Stories" }])} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Stories" }]} className="mb-6" />
      <header className="max-w-2xl border-b border-line pb-6">
        <p className="eyebrow">Journal</p>
        <h1 className="display-lg mt-2 text-indigo">Notes on cloth, craft and care</h1>
        <p className="body mt-3 text-muted">Short reads on fabric, makers and the small decisions that help a wardrobe last.</p>
      </header>

      {items.length ? (
        <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((story) => (
            <li key={story.id}>
              <article className="group">
                <Link href={`/stories/${story.slug}`} className="block overflow-hidden">
                  <MediaImage src={story.imageId} alt={story.title} ratio="4/5" sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw" className="transition-transform duration-500 group-hover:scale-[1.025]" />
                </Link>
                <p className="eyebrow mt-4">{story.tags[0] ?? "Journal"}</p>
                <h2 className="mt-2 font-display text-2xl text-indigo">
                  <Link href={`/stories/${story.slug}`} className="hover:underline hover:decoration-gold hover:underline-offset-4">{story.title}</Link>
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted">{story.excerpt}</p>
                <p className="caption mt-2">{formatDate(story.publishedAt)}</p>
                <Link href={`/stories/${story.slug}`} className="mt-3 inline-flex min-h-10 items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-indigo">
                  Read story <ArrowUpRight aria-hidden className="size-4" />
                </Link>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 max-w-xl text-sm text-muted">The journal is being written. New stories will appear here.</p>
      )}
    </main>
  );
}
