import type { Product, Review, User } from "./types";

const titles = ["Beautifully finished", "Easy to wear", "Lovely fabric", "A thoughtful buy", "Just right", "Good everyday piece"];
const notes = [
  "The fabric feels lovely against the skin and the finishing is neat. I have already worn it twice.",
  "A comfortable fit with a little room to move. The colour is true to the pictures and easy to style.",
  "Well made and thoughtfully packed. It has become an easy choice for work and weekends.",
  "The texture and small details make this feel special without being difficult to wear.",
  "Soft, breathable and comfortable through a long day. I would happily recommend it.",
  "A very considered piece. The fit is flattering and the fabric has a nice natural feel.",
];

export function createReviews(products: Product[], users: User[]): Review[] {
  return Array.from({ length: 120 }, (_, index): Review => {
    const product = products[index % products.length];
    const user = users[index % 3];
    const rating = ([5, 4, 5, 4, 3, 5, 4, 5, 2, 5] as const)[index % 10];
    return {
      id: `review-${String(index + 1).padStart(3, "0")}`,
      productId: product.id,
      userId: user.id,
      authorName: user.name,
      rating,
      title: titles[index % titles.length],
      body: notes[index % notes.length],
      createdAt: new Date(Date.UTC(2025, index % 12, 1 + (index % 27))).toISOString(),
      verifiedPurchase: index % 7 !== 0,
      helpfulCount: (index * 3) % 24,
      ...(index % 9 === 0 ? {
        imageIds: [
          `placeholder:review-${product.slug}-${index + 1}-1`,
          `placeholder:review-${product.slug}-${index + 1}-2`,
        ],
      } : {}),
    };
  });
}
