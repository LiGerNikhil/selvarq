"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import type { Review } from "@/data";
import { Button } from "@/components/ui/button";
import { MediaImage } from "@/components/ui/media-image";
import { Rating } from "@/components/ui/rating";
import { RatingInput } from "@/components/ui/rating-input";
import { formatDate } from "@/lib/format";
import type { ReviewSummary } from "@/lib/repo/reviews";

interface ProductReviewsProps {
  productSlug: string;
  productName: string;
  reviews: Review[];
  summary: ReviewSummary;
  canReview: boolean;
  signedIn: boolean;
}

type ReviewFilter = "all" | "verified" | "photos";

export function ProductReviews({ productSlug, productName, reviews, summary, canReview, signedIn }: ProductReviewsProps) {
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [helpful, setHelpful] = useState<string[]>([]);
  const [formRating, setFormRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const filteredReviews = useMemo(() => reviews.filter((review) =>
    (filter !== "verified" || review.verifiedPurchase) &&
    (filter !== "photos" || Boolean(review.imageIds?.length)) &&
    (ratingFilter === "all" || review.rating === Number(ratingFilter)),
  ), [reviews, filter, ratingFilter]);

  function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (formRating < 1) return;
    setSubmitted(true);
  }

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="scroll-mt-24 py-12 md:py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Thoughts from the people who wear it</p>
          <h2 id="reviews-title" className="display-lg text-indigo">Customer reviews</h2>
        </div>
        <Rating value={summary.average} count={summary.count} size="md" showValue />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(15rem,0.8fr)_2fr]">
        <div className="space-y-5">
          <div className="border border-line bg-pearl/50 p-5">
            <p className="mb-4 text-sm font-medium text-ink">Rating breakdown</p>
            <div className="space-y-2">
              {([5, 4, 3, 2, 1] as const).map((stars) => {
                const count = summary.distribution[stars];
                const percent = summary.count ? count / summary.count * 100 : 0;
                return (
                  <div key={stars} className="grid grid-cols-[2.25rem_1fr_2rem] items-center gap-2 text-xs">
                    <span>{stars} star</span>
                    <span className="h-2 overflow-hidden bg-line"><span className="block h-full bg-gold" style={{ width: `${percent}%` }} /></span>
                    <span className="text-right text-muted">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <label className="flex min-h-11 flex-1 items-center justify-between gap-3 border border-line px-3 text-sm">
              <span>Filter by rating</span>
              <select value={ratingFilter} onChange={(event) => setRatingFilter(event.target.value)} className="max-w-28 bg-transparent text-right text-indigo outline-none">
                <option value="all">All</option>
                {[5, 4, 3, 2, 1].map((stars) => <option key={stars} value={stars}>{stars} stars</option>)}
              </select>
            </label>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Review type">
              {([["all", "All reviews"], ["verified", "Verified"], ["photos", "With photos"]] as const).map(([value, label]) => (
                <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} className="min-h-11 border border-line px-3 text-xs aria-pressed:border-indigo aria-pressed:bg-indigo/5">{label}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {filteredReviews.length ? filteredReviews.map((review) => {
            const markedHelpful = helpful.includes(review.id);
            return (
              <article key={review.id} className="border-b border-line pb-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <Rating value={review.rating} size="sm" />
                    <h3 className="mt-1 text-sm font-medium text-ink">{review.title}</h3>
                  </div>
                  <time className="caption" dateTime={review.createdAt}>{formatDate(review.createdAt)}</time>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">{review.body}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
                  <span>{review.authorName}</span>
                  {review.verifiedPurchase ? <span className="border border-success/30 px-2 py-1 text-success">Verified purchase</span> : null}
                </div>
                {review.imageIds?.length ? (
                  <div className="mt-4 flex gap-2">
                    {review.imageIds.map((image, index) => <div key={image} className="w-20"><MediaImage src={image} alt={`Customer photo ${index + 1} for ${productName}`} ratio="1/1" sizes="80px" /></div>)}
                  </div>
                ) : null}
                <button type="button" aria-pressed={markedHelpful} onClick={() => setHelpful((current) => markedHelpful ? current.filter((id) => id !== review.id) : [...current, review.id])} className="mt-3 min-h-11 text-xs text-indigo underline underline-offset-4">
                  Helpful ({review.helpfulCount + (markedHelpful ? 1 : 0)})
                </button>
              </article>
            );
          }) : <p className="border border-line p-6 text-sm text-muted">No reviews match these filters. Try another view.</p>}

          <div className="border border-line bg-pearl/50 p-5">
            <h3 className="display-md text-indigo">Write a review</h3>
            {canReview ? submitted ? (
              <p role="status" className="mt-3 text-sm text-success">Thank you. Your review has been received in this demo session.</p>
            ) : (
              <form onSubmit={submitReview} className="mt-4 space-y-4">
                <p className="text-sm text-muted">You can review this piece because it appears in a delivered order.</p>
                <RatingInput value={formRating} onChange={setFormRating} />
                <label className="block text-sm">
                  <span className="mb-1 block">Review title</span>
                  <input name="title" required maxLength={100} className="min-h-11 w-full border border-line bg-ivory px-3 outline-none focus:border-indigo" />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block">Your experience</span>
                  <textarea name="body" required minLength={10} maxLength={1200} rows={4} className="w-full border border-line bg-ivory p-3 outline-none focus:border-indigo" />
                </label>
                <p className="caption">Demo only: review submissions are not saved to the catalogue.</p>
                <Button type="submit" disabled={!formRating}>Submit review</Button>
              </form>
            ) : (
              <p className="mt-3 text-sm text-muted">
                {signedIn ? "A delivered order is required before you can review this piece." : <>Sign in and order this piece to share a verified review. <Link href={`/login?next=${encodeURIComponent(`/product/${productSlug}#reviews`)}`} className="text-indigo underline underline-offset-4">Sign in</Link></>}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
