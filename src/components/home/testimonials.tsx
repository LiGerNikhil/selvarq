import { Quote, Star } from "lucide-react";
import { homepagePress, homepageTestimonials } from "@/data";

export function Testimonials() {
  return (
    <section className="page-container py-16 md:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="eyebrow">Worn and loved</p>
        <h2 className="display-md mt-3 text-indigo">Kind words, kept close</h2>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {homepageTestimonials.map((testimonial) => (
          <figure key={testimonial.name} className="flex min-h-56 flex-col border border-line bg-white/50 p-6">
            <Quote aria-hidden className="size-6 text-gold-ink" />
            <blockquote className="mt-4 flex-1 font-display text-2xl leading-snug text-indigo">“{testimonial.quote}”</blockquote>
            <figcaption className="mt-5 flex items-end justify-between gap-3">
              <span><span className="block text-sm font-medium text-ink">{testimonial.name}</span><span className="caption">{testimonial.detail}</span></span>
              <span className="flex gap-0.5" aria-label={`${testimonial.rating} out of 5 stars`}>
                {Array.from({ length: testimonial.rating }, (_, index) => <Star key={index} aria-hidden className="size-3.5 fill-gold text-gold" />)}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-14 border-y border-line py-6">
        <p className="eyebrow text-center">In good company</p>
        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 md:gap-x-16">
          {homepagePress.map((publication) => (
            <li key={publication} className="font-display text-xl text-muted md:text-2xl">{publication}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
