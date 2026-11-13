import Link from "next/link";
import { getSession } from "@/lib/auth/demo-session";
import { products } from "@/data";
import { reviewsRepository } from "@/lib/repo";
import { formatDate } from "@/lib/format";

export default async function AccountReviewsPage() {
  const session = await getSession();
  if (!session) return null;
  const result = await reviewsRepository.list({ userId: session.userId, page: 1, pageSize: 50 });
  return <section><p className="eyebrow mb-2">Your notes</p><h2 className="display-md mb-6 text-indigo">Reviews</h2>
    {result.items.length ? <ul className="divide-y divide-line border-y border-line">{result.items.map((review) => {
      const product = products.find((item) => item.id === review.productId);
      return <li key={review.id} className="py-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium">{review.title}</p><p className="caption mt-1">{product ? <Link href={`/product/${product.slug}`} className="text-indigo underline underline-offset-4">{product.name}</Link> : "SELVARQ piece"} · {formatDate(review.createdAt)}</p></div><span className="text-sm text-gold-ink" aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}</span></div><p className="mt-2 text-sm text-muted">{review.body}</p></li>;
    })}</ul> : <p className="border border-line p-5 text-sm text-muted">Reviews you write for eligible purchases will be collected here.</p>}
  </section>;
}
