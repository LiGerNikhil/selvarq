import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { MediaImage } from "@/components/ui/media-image";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import { storiesRepository } from "@/lib/repo";

interface RouteProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const story = await storiesRepository.getBySlug(slug);
  if (!story) return { title: "Story not found" };
  return pageMetadata({
    title: story.title,
    description: story.excerpt,
    path: `/stories/${story.slug}`,
    type: "article",
  });
}

export const dynamic = "force-dynamic";

export default async function StoryPage({ params }: RouteProps) {
  const { slug } = await params;
  const story = await storiesRepository.getBySlug(slug);
  if (!story) notFound();

  return (
    <main className="page-container py-8 md:py-12">
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Stories", path: "/stories" }, { name: story.title }]),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: story.title,
            description: story.excerpt,
            datePublished: story.publishedAt,
            articleSection: story.tags[0],
            publisher: { "@type": "Organization", name: "SELVARQ", url: absoluteUrl("/") },
            mainEntityOfPage: absoluteUrl(`/stories/${story.slug}`),
          },
        ]}
      />
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Stories", href: "/stories" }, { label: story.title }]}
        className="mb-6"
      />

      <article className="mx-auto max-w-3xl">
        <p className="eyebrow">{story.tags.join(" · ") || "Journal"}</p>
        <h1 className="display-lg mt-2 text-indigo">{story.title}</h1>
        <p className="caption mt-3">Published {formatDate(story.publishedAt)}</p>
        <MediaImage
          src={story.imageId}
          alt={story.title}
          ratio="16/9"
          sizes="(min-width: 768px) 48rem, 100vw"
          className="mt-6"
          preload
        />
        <p className="body mt-6 text-ink">{story.body}</p>
        <p className="mt-4 text-sm leading-6 text-muted">Read more notes on cloth, craft and care in the journal.</p>
        <Link href="/stories" className="mt-8 inline-flex min-h-11 items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-indigo underline decoration-gold underline-offset-4">
          <ArrowLeft aria-hidden className="size-4" /> All stories
        </Link>
      </article>
    </main>
  );
}
