import type { Collection, Merchant, Product, ProductVariant } from "./types";

const seeds: [string, string, string, string, string, string, number, number][] = [
  ["Ivory Handloom Shirt", "men-shirts", "Ivory", "Cotton handloom", "Relaxed", "loom-and-line", 349900, 289900],
  ["Indigo Stripe Shirt", "men-shirts", "Indigo", "Cotton poplin", "Regular", "blue-peepal", 299900, 249900],
  ["Soft Khadi Overshirt", "men-shirts", "Sand", "Khadi cotton", "Relaxed", "sharda-garments", 329900, 269900],
  ["Everyday Cotton Tee", "men-tees", "Pearl", "Organic cotton", "Regular", "blue-peepal", 149900, 119900],
  ["Indigo Weekend Tee", "men-tees", "Indigo", "Slub cotton", "Relaxed", "sharda-garments", 169900, 139900],
  ["Textured Pocket Tee", "men-tees", "Olive", "Cotton jersey", "Regular", "north-cotton-house", 179900, 149900],
  ["Tapered Cotton Trouser", "men-trousers", "Stone", "Cotton twill", "Tapered", "sharda-garments", 329900, 279900],
  ["Linen Drawstring Trouser", "men-trousers", "Natural", "Linen cotton", "Relaxed", "loom-and-line", 359900, 309900],
  ["Deep Navy Straight Trouser", "men-trousers", "Navy", "Cotton twill", "Straight", "blue-peepal", 339900, 289900],
  ["Ajrakh Panel Kurta", "men-kurtas", "Indigo", "Cotton", "Straight", "sharda-garments", 389900, 329900],
  ["Sandstone Short Kurta", "men-kurtas", "Sand", "Linen cotton", "Relaxed", "nadi-collective", 319900, 269900],
  ["Festive Collar Kurta", "men-kurtas", "Maroon", "Cotton silk", "Regular", "gulmohar-studio", 459900, 389900],
  ["Monsoon Utility Jacket", "men-jackets", "Olive", "Cotton canvas", "Relaxed", "north-cotton-house", 549900, 469900],
  ["Quilted Indigo Jacket", "men-jackets", "Indigo", "Quilted cotton", "Regular", "sharda-garments", 599900, 519900],
  ["Lightweight Travel Jacket", "men-jackets", "Stone", "Cotton blend", "Regular", "blue-peepal", 499900, 429900],
  ["Chanderi Everyday Kurta", "women-kurtas", "Rose", "Chanderi cotton", "Straight", "sharda-garments", 399900, 339900],
  ["Printed Mul Kurta", "women-kurtas", "Indigo", "Mul cotton", "Relaxed", "nadi-collective", 329900, 279900],
  ["Zari Neckline Kurta", "women-kurtas", "Maroon", "Cotton silk", "Straight", "gulmohar-studio", 489900, 419900],
  ["Meadow Shirt Dress", "women-dresses", "Sage", "Cotton voile", "A-line", "loom-and-line", 429900, 369900],
  ["Indigo Day Dress", "women-dresses", "Indigo", "Hand-block cotton", "Relaxed", "sharda-garments", 399900, 339900],
  ["Evening Pleat Dress", "women-dresses", "Burgundy", "Viscose crepe", "A-line", "gulmohar-studio", 599900, 519900],
  ["Linen Co-ord Set", "women-co-ords", "Natural", "Linen cotton", "Relaxed", "loom-and-line", 649900, 559900],
  ["Indigo Everyday Co-ord", "women-co-ords", "Indigo", "Cotton", "Relaxed", "sharda-garments", 579900, 499900],
  ["Zari Festive Co-ord", "women-co-ords", "Gold", "Chanderi silk", "Straight", "gulmohar-studio", 899900, 779900],
  ["Tussar Heirloom Saree", "women-sarees", "Natural", "Tussar silk", "Classic drape", "gulmohar-studio", 1299900, 1099900],
  ["Indigo Handblock Saree", "women-sarees", "Indigo", "Cotton", "Classic drape", "sharda-garments", 699900, 599900],
  ["Soft Gold Zari Saree", "women-sarees", "Gold", "Chanderi silk", "Classic drape", "sunehri-thread", 1599900, 1399900],
  ["Everyday Linen Tunic", "women-tops", "Pearl", "Linen cotton", "Relaxed", "loom-and-line", 289900, 239900],
  ["Gathered Cotton Top", "women-tops", "Sage", "Cotton voile", "Easy", "nadi-collective", 259900, 219900],
  ["Handwoven Wrap Top", "women-tops", "Indigo", "Handloom cotton", "Wrap", "sharda-garments", 319900, 269900],
  ["Wide-Leg Linen Pant", "women-bottoms", "Natural", "Linen cotton", "Wide leg", "loom-and-line", 349900, 299900],
  ["Tapered Everyday Pant", "women-bottoms", "Olive", "Cotton twill", "Tapered", "blue-peepal", 299900, 259900],
  ["Indigo Straight Trouser", "women-bottoms", "Indigo", "Cotton", "Straight", "sharda-garments", 329900, 279900],
  ["Cloud Cotton Lounge Set", "unisex-loungewear", "Pearl", "Brushed cotton", "Relaxed", "north-cotton-house", 449900, 379900],
  ["Weekend Jersey Lounge Set", "unisex-loungewear", "Sage", "Cotton jersey", "Relaxed", "blue-peepal", 399900, 339900],
  ["Soft Knit Lounge Pant", "unisex-loungewear", "Charcoal", "Cotton knit", "Relaxed", "sharda-garments", 249900, 209900],
  ["Everyday Cotton Vest", "unisex-essentials", "Pearl", "Organic cotton", "Regular", "blue-peepal", 99900, 79900],
  ["Ribbed Essential Tee", "unisex-essentials", "Stone", "Cotton rib", "Regular", "sharda-garments", 139900, 109900],
  ["Lightweight Base Layer", "unisex-essentials", "Navy", "Cotton modal", "Close", "loom-and-line", 159900, 129900],
  ["Festive Zari Jacket", "occasion-festive", "Gold", "Silk blend", "Regular", "gulmohar-studio", 999900, 859900],
  ["Marigold Celebration Kurta", "occasion-festive", "Marigold", "Cotton silk", "Straight", "sharda-garments", 559900, 479900],
  ["Embroidered Evening Set", "occasion-festive", "Maroon", "Chanderi silk", "Easy", "sunehri-thread", 1199900, 999900],
  ["Rosewood Wedding Saree", "occasion-wedding", "Rose", "Tissue silk", "Classic drape", "gulmohar-studio", 1899900, 1649900],
  ["Ivory Ceremony Kurta", "occasion-wedding", "Ivory", "Silk cotton", "Straight", "sharda-garments", 699900, 599900],
  ["Heirloom Embroidered Set", "occasion-wedding", "Deep teal", "Chanderi silk", "A-line", "sunehri-thread", 1499900, 1299900],
  ["Tailored Linen Blazer", "occasion-workwear", "Stone", "Linen blend", "Tailored", "loom-and-line", 899900, 779900],
  ["Classic Work Shirt", "occasion-workwear", "Blue", "Cotton poplin", "Regular", "blue-peepal", 329900, 279900],
  ["Easy Workwear Co-ord", "occasion-workwear", "Olive", "Cotton linen", "Straight", "sharda-garments", 599900, 519900],
];

const palette: Record<string, string> = {
  Ivory: "#F4EFE4", Indigo: "#343D73", Sand: "#C9B89A", Pearl: "#F8F5EE",
  Olive: "#77785B", Stone: "#A69F91", Natural: "#D8CBB2", Navy: "#263451",
  Maroon: "#753D4C", Rose: "#C98F91", Sage: "#9FA68E", Burgundy: "#703443",
  Gold: "#C3A45E", Charcoal: "#4D4A48", Marigold: "#D39B42", "Deep teal": "#315F60",
  Blue: "#6E88A5",
};
const sizes: ProductVariant["size"][] = ["XS", "S", "M", "L", "XL", "XXL"];
const colors = Object.keys(palette);

function makeVariants(productId: string, colorList: string[], index: number): ProductVariant[] {
  return colorList.flatMap((color, colorIndex) =>
    sizes.map((size, sizeIndex) => ({
      id: `${productId}-${color.toLowerCase().replace(/\s+/g, "-")}-${size.toLowerCase()}`,
      color,
      colorHex: palette[color],
      size,
      stock: (index * 7 + colorIndex * 5 + sizeIndex * 3) % 18,
      sku: `SVQ-${String(index + 1).padStart(3, "0")}-${colorIndex + 1}${sizeIndex + 1}`,
    })),
  );
}

export function createProducts(merchants: Merchant[], collections: Collection[]): Product[] {
  const merchantIds = new Set(merchants.map((merchant) => merchant.id));
  const activeCollectionIds = collections.map((collection) => collection.id);
  return seeds.map(([name, categoryId, mainColor, fabric, fit, merchantId, mrp, price], index): Product => {
    const id = `product-${String(index + 1).padStart(3, "0")}`;
    const colorCount = 2 + (index % 5);
    const rotatedPalette = [...colors.slice(index % colors.length), ...colors.slice(0, index % colors.length)];
    const uniqueColors = [
      mainColor,
      ...rotatedPalette.filter((color) => color !== mainColor).slice(0, colorCount - 1),
    ];
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const productCollections = [activeCollectionIds[index % activeCollectionIds.length], activeCollectionIds[(index + 3) % activeCollectionIds.length]];
    return {
      id, name, slug,
      description: `${name}, made for comfortable repeat wear with considered finishing and a versatile silhouette.`,
      story: `Designed in India, the ${name.toLowerCase()} brings ${fabric.toLowerCase()} together with an easy ${fit.toLowerCase()} fit. It is thoughtfully finished for everyday use and made to feel at home in a well-loved wardrobe.`,
      merchantId: merchantIds.has(merchantId) ? merchantId : "sharda-garments",
      categoryId,
      collectionIds: [...new Set(productCollections)],
      imageIds: Array.from({ length: 3 + (index % 4) }, (_, imageIndex) => `placeholder:${slug}-${imageIndex + 1}`),
      colors: uniqueColors.map((color) => ({ name: color, hex: palette[color] })),
      sizes,
      variants: makeVariants(id, uniqueColors, index),
      price, mrp, fabric, fit,
      care: ["Gentle machine wash cold", "Wash with like colours", "Dry in shade", "Warm iron if needed"],
      highlights: [
        `${fabric} with a soft, breathable hand feel`,
        `${fit} fit for easy movement`,
        "Thoughtful finishing by skilled makers",
      ],
      tags: [categoryId.split("-").slice(1).join("-"), fabric.toLowerCase().replace(/\s+/g, "-"), fit.toLowerCase().replace(/\s+/g, "-"), uniqueColors[0].toLowerCase()],
      seo: {
        title: `${name} | SELVARQ`,
        description: `Shop the ${name} at SELVARQ. Discover considered Indian design in ${fabric.toLowerCase()}, made for lasting comfort.`,
      },
      rating: { average: Number((4.1 + (index % 9) / 10).toFixed(1)), count: 8 + ((index * 13) % 146) },
      status: merchantIds.has(merchantId) && merchants.find((merchant) => merchant.id === merchantId)?.status === "approved" ? "active" : "draft",
    };
  });
}

export const productSeeds = seeds.length;
