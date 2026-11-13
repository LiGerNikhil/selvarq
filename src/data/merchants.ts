import type { Merchant } from "./types";

export const merchants: Merchant[] = [
  {
    id: "sharda-garments", name: "Sharda Garments", slug: "sharda-garments",
    status: "approved", bio: "A family-run atelier bringing considered Indian craft and everyday ease together. We make pieces to be worn often and kept for years.",
    city: "Jaipur", logoId: "placeholder:merchant-sharda-garments",
    rating: { average: 4.8, count: 426 }, joinedAt: "2022-04-18T00:00:00.000Z",
  },
  {
    id: "loom-and-line", name: "Loom & Line", slug: "loom-and-line", status: "approved",
    bio: "Small-batch linen and cotton clothing, cut simply and finished by skilled makers.",
    city: "Kochi", logoId: "placeholder:merchant-loom-and-line",
    rating: { average: 4.6, count: 118 }, joinedAt: "2023-02-11T00:00:00.000Z",
  },
  {
    id: "gulmohar-studio", name: "Gulmohar Studio", slug: "gulmohar-studio", status: "approved",
    bio: "Contemporary occasionwear inspired by heirloom embroidery and the colours of Rajasthan.",
    city: "Jaipur", logoId: "placeholder:merchant-gulmohar-studio",
    rating: { average: 4.7, count: 93 }, joinedAt: "2023-08-03T00:00:00.000Z",
  },
  {
    id: "nadi-collective", name: "Nadi Collective", slug: "nadi-collective", status: "pending",
    bio: "Relaxed silhouettes and hand-finished details made with responsibly sourced fabrics.",
    city: "Pune", logoId: "placeholder:merchant-nadi-collective",
    rating: { average: 4.4, count: 27 }, joinedAt: "2025-01-19T00:00:00.000Z",
  },
  {
    id: "blue-peepal", name: "Blue Peepal", slug: "blue-peepal", status: "approved",
    bio: "A wardrobe of versatile, well-made staples for busy city days and slower weekends.",
    city: "Bengaluru", logoId: "placeholder:merchant-blue-peepal",
    rating: { average: 4.5, count: 76 }, joinedAt: "2024-03-26T00:00:00.000Z",
  },
  {
    id: "sunehri-thread", name: "Sunehri Thread", slug: "sunehri-thread", status: "rejected",
    bio: "Traditional handwork reinterpreted for celebrations and family gatherings.",
    city: "Lucknow", logoId: "placeholder:merchant-sunehri-thread",
    rating: { average: 4.2, count: 14 }, joinedAt: "2024-07-14T00:00:00.000Z",
  },
  {
    id: "north-cotton-house", name: "North Cotton House", slug: "north-cotton-house", status: "suspended",
    bio: "Soft cotton layers and uncomplicated forms for the changing seasons.",
    city: "Delhi", logoId: "placeholder:merchant-north-cotton-house",
    rating: { average: 4.1, count: 38 }, joinedAt: "2023-11-09T00:00:00.000Z",
  },
];
