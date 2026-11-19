import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MediaImage } from "@/components/ui/media-image";
import type { Category, Product } from "@/data";

export function CategoryTiles({ categories, products }: { categories: Category[]; products: Product[] }) {
  return (
    <section className="page-container py-16 md:py-24">
      <SectionHeading eyebrow="Find your next favourite" title="Shop by category" href="/shop" linkText="Explore all" />
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {categories.map((category, index) => {
          const product = products.find((item) => item.categoryId.startsWith(`${category.id}-`));
          const seed = category.imageId ?? product?.imageIds[0] ?? `placeholder:category-${category.slug}`;
          return (
            <Link key={category.id} href={`/category/${category.slug}`} className={`group relative overflow-hidden ${index === 0 ? "col-span-2 row-span-2" : ""}`}>
              <MediaImage
                src={seed}
                alt={`${category.name} clothing`}
                ratio="4/5"
                sizes={index === 0 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
                className="transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-indigo-deep/70 via-transparent to-transparent" />
              <span className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 text-ivory sm:p-5">
                <span>
                  <span className="block font-display text-2xl tracking-wide sm:text-3xl">{category.name}</span>
                  <span className="mt-1 block text-xs text-ivory/80">Explore the edit</span>
                </span>
                <ArrowUpRight aria-hidden className="mb-1 size-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, href, linkText }: { eyebrow: string; title: string; href?: string; linkText?: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="display-md mt-2 text-indigo">{title}</h2>
      </div>
      {href && linkText ? <Link href={href} className="inline-flex min-h-11 shrink-0 items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-indigo underline decoration-gold underline-offset-4">{linkText}<ArrowUpRight aria-hidden className="size-4" /></Link> : null}
    </div>
  );
}
