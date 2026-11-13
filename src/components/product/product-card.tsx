"use client";

import Link from "next/link";
import { useRef, useState, type MouseEvent, type TouchEvent } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { MediaImage } from "@/components/ui/media-image";
import { Sheet } from "@/components/ui/sheet";
import { merchants, products, type Product } from "@/data";
import { toast } from "@/store/toast-store";
import { useCartStore } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { cn } from "@/lib/utils";

const newestIds = new Set([...products].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 8).map((product) => product.id));
const bestsellerIds = new Set([...products].sort((a, b) => b.rating.count - a.rating.count || b.rating.average - a.rating.average).slice(0, 8).map((product) => product.id));

export function ProductCard({ product, isNew, bestseller, merchantName }: { product: Product; isNew?: boolean; bestseller?: boolean; merchantName?: string }) {
  const saved = useWishlistStore((state) => state.productIds.includes(product.id));
  const toggle = useWishlistStore((state) => state.toggle);
  const merchant = merchants.find((item) => item.id === product.merchantId);
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name ?? "");
  const [selectedSize, setSelectedSize] = useState<Product["sizes"][number] | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const didSwipe = useRef(false);
  const addItem = useCartStore((state) => state.addItem);
  const setCartOpen = useUIStore((state) => state.setCartOpen);
  const images = product.imageIds.slice(0, 6);
  const activeColor = product.colors.find((color) => color.name === selectedColor) ?? product.colors[0];
  const isFresh = isNew ?? newestIds.has(product.id);
  const isBestseller = bestseller ?? bestsellerIds.has(product.id);
  const discount = product.mrp > product.price ? Math.floor((product.mrp - product.price) / product.mrp * 100) : 0;
  const stockForSize = (size: Product["sizes"][number]) =>
    product.variants.some((variant) => variant.color === activeColor?.name && variant.size === size && variant.stock > 0);

  function onTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStart === null) return;
    const delta = event.changedTouches[0]?.clientX;
    if (delta !== undefined && Math.abs(delta - touchStart) > 30) {
      didSwipe.current = true;
      setImageIndex((current) => (current + (delta < touchStart ? 1 : -1) + images.length) % images.length);
    }
    setTouchStart(null);
  }

  function preventSwipeNavigation(event: MouseEvent<HTMLAnchorElement>) {
    if (!didSwipe.current) return;
    event.preventDefault();
    event.stopPropagation();
    didSwipe.current = false;
  }

  function addToBag() {
    if (!selectedSize || !activeColor) return;
    const variant = product.variants.find((item) => item.color === activeColor.name && item.size === selectedSize && item.stock > 0);
    if (!variant) return;
    addItem({
      productId: product.id,
      variantId: variant.id,
      merchantId: product.merchantId,
      name: product.name,
      imageId: product.imageIds[0],
      color: variant.color,
      size: variant.size,
      unitPrice: product.price,
      mrp: product.mrp,
      quantity: 1,
    });
    setQuickAddOpen(false);
    toast.success("Added to your bag", { description: `${product.name} · ${variant.color}, ${variant.size}` });
    setCartOpen(true);
  }

  return (
    <article className="group min-w-0">
      <div className="relative" onTouchStart={(event) => setTouchStart(event.touches[0]?.clientX ?? null)} onTouchEnd={onTouchEnd}>
        <Link href={`/product/${product.slug}`} onClick={preventSwipeNavigation} className="relative block overflow-hidden">
          <MediaImage src={images[imageIndex] ?? product.imageIds[0] ?? "placeholder:product"} alt={product.name} ratio="4/5" sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 72vw" />
          {images[1] ? (
            <MediaImage
              src={images[1]}
              alt={`${product.name}, alternate view`}
              ratio="4/5"
              sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 72vw"
              className="pointer-events-none absolute inset-0 hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block"
            />
          ) : null}
        </Link>
        <div className="absolute left-2 top-2 flex max-w-[75%] flex-wrap gap-1">
          {isFresh ? <Badge variant="gold">New</Badge> : null}
          {isBestseller ? <Badge variant="indigo">Bestseller</Badge> : null}
          {discount ? <Badge variant="sale">{discount}% off</Badge> : null}
        </div>
        <button
          type="button"
          onClick={() => toggle(product.id)}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={saved}
          className="absolute right-2 top-2 grid size-11 place-items-center rounded-full bg-ivory/90 text-indigo shadow-sm transition-colors hover:bg-white"
        >
          <Heart aria-hidden className={cn("size-5", saved && "fill-burgundy text-burgundy")} />
        </button>
        {images.length > 1 ? (
          <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5 md:hidden" role="group" aria-label={`${product.name} image ${imageIndex + 1} of ${images.length}`}>
            {images.map((image, index) => (
              <button key={image} type="button" onClick={() => setImageIndex(index)} aria-label={`Show product image ${index + 1}`} aria-current={index === imageIndex ? "true" : undefined} className={cn("size-2 rounded-full border border-ivory shadow", index === imageIndex ? "bg-indigo" : "bg-ivory/75")} />
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5 pt-3">
        <p className="truncate text-[10px] font-medium uppercase tracking-[0.14em] text-muted">{merchantName ?? merchant?.name ?? "SELVARQ"}</p>
        <Link href={`/product/${product.slug}`} className="line-clamp-2 min-h-10 text-sm font-medium leading-5 text-ink hover:text-indigo">
          {product.name}
        </Link>
        <p className="truncate text-xs text-muted">{product.fabric} · {product.fit} fit</p>
        <Price price={product.price} mrp={product.mrp} size="sm" />
        <div className="flex items-center gap-1.5 text-xs">
          <span className="inline-flex items-center gap-1 bg-success px-1.5 py-0.5 font-medium text-white">{product.rating.average.toFixed(1)} <span aria-hidden>★</span></span>
          <span className="text-muted">({product.rating.count})</span>
        </div>
        <div className="flex min-h-10 items-center gap-2" aria-label="Available colours">
          {product.colors.slice(0, 5).map((color) => (
            <button key={color.name} type="button" title={color.name} aria-label={`${color.name} colour`} aria-pressed={selectedColor === color.name} onClick={() => setSelectedColor(color.name)} className={cn("grid size-7 place-items-center rounded-full border-2", selectedColor === color.name ? "border-indigo" : "border-transparent")}>
              <span className="size-4 rounded-full border border-black/10" style={{ backgroundColor: color.hex }} />
            </button>
          ))}
          {product.colors.length > 5 ? <span className="text-xs text-muted">+{product.colors.length - 5}</span> : null}
        </div>
        <Button size="sm" variant="ghost" fullWidth leftIcon={<ShoppingBag aria-hidden className="size-4" />} onClick={() => setQuickAddOpen(true)}>
          Quick add
        </Button>
      </div>
      <Sheet open={quickAddOpen} onOpenChange={setQuickAddOpen} title="Choose your size" description={`${product.name} · ${activeColor?.name ?? ""}`} side="bottom">
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((size) => {
            const available = stockForSize(size);
            return (
              <button key={size} type="button" disabled={!available} aria-pressed={selectedSize === size} onClick={() => setSelectedSize(size)} className={cn("min-h-11 min-w-12 border px-3 text-sm transition-colors", selectedSize === size ? "border-indigo bg-indigo text-ivory" : "border-line text-ink hover:border-indigo", !available && "cursor-not-allowed text-muted line-through opacity-50")}>
                {size}
              </button>
            );
          })}
        </div>
        <p className="caption mt-4">Fit: {product.fit}. Select a size to add this piece to your bag.</p>
        <div className="mt-5">
          <Price price={product.price} mrp={product.mrp} />
        </div>
        <div className="mt-5">
          <Button fullWidth disabled={!selectedSize || !stockForSize(selectedSize)} onClick={addToBag}>Add to bag</Button>
        </div>
      </Sheet>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <article aria-hidden="true" className="animate-pulse">
      <div className="aspect-[4/5] bg-pearl" />
      <div className="space-y-3 pt-3">
        <div className="h-3 w-1/3 bg-pearl" />
        <div className="h-4 w-4/5 bg-pearl" />
        <div className="h-3 w-2/3 bg-pearl" />
        <div className="h-4 w-1/2 bg-pearl" />
      </div>
    </article>
  );
}
