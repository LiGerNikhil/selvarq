import type { Collection } from "./types";

const collectionInfo = [
  ["The Wedding Edit", "the-wedding-edit", "Ceremony-ready silhouettes and fine detail for the days you will remember.", "occasion-wedding"],
  ["Everyday Linen", "everyday-linen", "Breathable linen and cotton for unhurried mornings and long days.", "women-tops"],
  ["Monsoon Layers", "monsoon-layers", "Light layers and quick-drying textures for the season in between.", "men-jackets"],
  ["Festive Zari", "festive-zari", "A measured gleam of zari, made for evenings together.", "occasion-festive"],
  ["Office Ease", "office-ease", "Polished, comfortable pieces to make getting dressed simpler.", "occasion-workwear"],
  ["Quiet Neutrals", "quiet-neutrals", "Soft shades and enduring shapes that work beautifully together.", "unisex-essentials"],
] as const;

export const collections: Collection[] = collectionInfo.map(([name, slug, description, seed], index) => ({
  id: `collection-${index + 1}`,
  name,
  slug,
  description,
  productIds: [],
  imageId: `placeholder:collection-${seed}`,
}));
