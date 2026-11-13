import type { Category } from "./types";

const departments: Category[] = [
  { id: "men", name: "Men", slug: "men", parentId: null, description: "Considered pieces for every day and occasion." },
  { id: "women", name: "Women", slug: "women", parentId: null, description: "Modern Indian dressing, made with care." },
  { id: "unisex", name: "Unisex", slug: "unisex", parentId: null, description: "Easy essentials designed to be shared." },
  { id: "occasion", name: "Occasion", slug: "occasion", parentId: null, description: "Thoughtful edits for the moments that matter." },
];

const subcategories: [string, string, string][] = [
  ["men", "Shirts", "shirts"], ["men", "Tees", "tees"],
  ["men", "Trousers", "trousers"], ["men", "Kurtas", "kurtas"],
  ["men", "Jackets", "jackets"], ["women", "Kurtas", "kurtas"],
  ["women", "Dresses", "dresses"], ["women", "Co-ords", "co-ords"],
  ["women", "Sarees", "sarees"], ["women", "Tops", "tops"],
  ["women", "Bottoms", "bottoms"], ["unisex", "Loungewear", "loungewear"],
  ["unisex", "Essentials", "essentials"], ["occasion", "Festive", "festive"],
  ["occasion", "Wedding", "wedding"], ["occasion", "Workwear", "workwear"],
];

export const categories: Category[] = [
  ...departments,
  ...subcategories.map(([parentId, name, slug]) => ({
    id: `${parentId}-${slug}`,
    name,
    slug: `${parentId}-${slug}`,
    parentId,
    description: `${name} selected for lasting comfort, considered detail and easy wear.`,
  })),
];
