import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import type { Category, Product } from "@/data";
import type { CustomerPreferences } from "@/lib/demo-account-store";

export function ForYouRail({ products, categories, preferences }: {
  products: Product[];
  categories: Category[];
  preferences: CustomerPreferences;
}) {
  const selected = new Set(preferences.favoriteCategories);
  const categoryAndGenderMatches = (product: Product) => {
    const category = categories.find((item) => item.id === product.categoryId);
    const parent = categories.find((item) => item.id === category?.parentId);
    const categoryMatch = selected.size === 0 || selected.has(product.categoryId) || Boolean(parent && selected.has(parent.id));
    const genderMatch = preferences.gender === "no_preference" || preferences.gender === "unisex"
      || parent?.name.toLowerCase() === preferences.gender;
    return categoryMatch && genderMatch;
  };
  const sizeMatches = (product: Product) => preferences.usualSizes.length === 0 || product.sizes.some((size) => preferences.usualSizes.includes(size));
  const styleMatches = (product: Product) => {
    const searchText = `${product.name} ${product.tags.join(" ")}`.toLowerCase();
    return preferences.styles.length === 0 || preferences.styles.some((style) => searchText.includes(style.toLowerCase()));
  };
  const base = products.filter(categoryAndGenderMatches);
  const tailored = base.filter((product) => sizeMatches(product) && styleMatches(product));
  const sizeFallback = base.filter(sizeMatches);
  const recommendations = (tailored.length ? tailored : sizeFallback.length ? sizeFallback : base).slice(0, 8);
  if (!recommendations.length) return null;

  return (
    <section className="page-container py-14 md:py-20" aria-labelledby="for-you-heading">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div><p className="eyebrow mb-2">Chosen around your style</p><h2 id="for-you-heading" className="display-md text-indigo">For you</h2></div>
        <Link href="/account/preferences" className="hidden min-h-11 items-center text-sm text-indigo underline underline-offset-4 sm:inline-flex">Edit preferences</Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {recommendations.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
      <Link href="/account/preferences" className="mt-4 inline-flex min-h-11 items-center text-sm text-indigo underline underline-offset-4 sm:hidden">Edit preferences</Link>
    </section>
  );
}
