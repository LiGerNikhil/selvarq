export interface BrandStoryChapter {
  id: string;
  chapter: string;
  title: string;
  body: string;
  imageId: string;
  imageAlt: string;
  pullQuote: string;
}

export const brandStoryChapters: BrandStoryChapter[] = [
  {
    id: "cloth-with-character",
    chapter: "01 — The cloth",
    title: "Begin with what lasts.",
    body: "We begin with cloth that feels honest in the hand: breathable cotton, airy linen and handloom textures with a life of their own. Natural character is not something to hide. It is the beginning of a garment worth reaching for.",
    imageId: "placeholder:story-chapter-cloth-handloom",
    imageAlt: "A close study of handloom cloth and natural fibres",
    pullQuote: "Good clothing begins long before the first cut.",
  },
  {
    id: "hands-at-work",
    chapter: "02 — The makers",
    title: "Made by many hands.",
    body: "A garment carries the knowledge of the people who make it. We work with makers who understand the balance of a shoulder, the fall of a hem and the quiet precision it takes to bring a design to life.",
    imageId: "placeholder:story-chapter-makers-at-work",
    imageAlt: "A maker carefully working on a garment",
    pullQuote: "Every careful stitch is a promise to the person who wears it.",
  },
  {
    id: "finished-to-keep",
    chapter: "03 — The finish",
    title: "Thought through to the edge.",
    body: "Look closely and you will find the difference in the details: selvedge-finished edges, considered seams and a clean finish inside and out. These are the small decisions that help a piece keep its shape, its feel and its place in your wardrobe.",
    imageId: "placeholder:story-chapter-selvedge-finish",
    imageAlt: "A fine selvedge edge and carefully finished seam",
    pullQuote: "A piece made to last is a piece made with care at every edge.",
  },
];
