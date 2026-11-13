"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, GripVertical, Plus, Trash2 } from "lucide-react";
import type { Category, Product, ProductVariant } from "@/data";
import { ProductCard } from "@/components/product/product-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaImage } from "@/components/ui/media-image";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/store/toast-store";
import { merchantProductSchema } from "@/lib/merchant-schemas";
import type { MerchantProductInput } from "@/lib/demo-merchant-store";

const sizes: ProductVariant["size"][] = ["XS", "S", "M", "L", "XL", "XXL"];
const colorsFallback = [{ name: "Ivory", hex: "#F4EFE4" }];
const paise = (value: string) => Math.round(Number(value) * 100);

export function MerchantProductEditor({ categories, merchantId, merchantName, initialProduct }: { categories: Category[]; merchantId: string; merchantName: string; initialProduct?: Product }) {
  const router = useRouter();
  const [name, setName] = useState(initialProduct?.name ?? "");
  const [categoryId, setCategoryId] = useState(initialProduct?.categoryId ?? categories[0]?.id ?? "");
  const [description, setDescription] = useState(initialProduct?.description ?? "");
  const [story, setStory] = useState(initialProduct?.story ?? "");
  const [fabric, setFabric] = useState(initialProduct?.fabric ?? "");
  const [fit, setFit] = useState(initialProduct?.fit ?? "");
  const [price, setPrice] = useState(initialProduct ? String(initialProduct.price / 100) : "");
  const [mrp, setMrp] = useState(initialProduct ? String(initialProduct.mrp / 100) : "");
  const [colors, setColors] = useState(initialProduct?.colors ?? colorsFallback);
  const [selectedSizes, setSelectedSizes] = useState<ProductVariant["size"][]>(initialProduct?.sizes ?? ["S", "M", "L"]);
  const [variants, setVariants] = useState<Record<string, { sku: string; stock: number; price: string }>>(() => Object.fromEntries((initialProduct?.variants ?? []).map((variant) => [`${variant.color}|${variant.size}`, { sku: variant.sku, stock: variant.stock, price: String((variant.price ?? initialProduct?.price ?? 0) / 100) }])));
  const [images, setImages] = useState((initialProduct?.imageIds ?? ["placeholder:merchant-product-one", "placeholder:merchant-product-two", "placeholder:merchant-product-three"]).map((id, index) => ({ id, label: `Product image ${index + 1}` })));
  const [careText, setCareText] = useState(initialProduct?.care.join("\n") ?? "Gentle machine wash cold\nDry in shade");
  const [highlightsText, setHighlightsText] = useState(initialProduct?.highlights.join("\n") ?? "");
  const [tagsText, setTagsText] = useState(initialProduct?.tags.join(", ") ?? "");
  const [seoTitle, setSeoTitle] = useState(initialProduct?.seo.title ?? "");
  const [seoDescription, setSeoDescription] = useState(initialProduct?.seo.description ?? "");
  const [status, setStatus] = useState<Product["status"]>(initialProduct?.status ?? "draft");
  const [busy, setBusy] = useState(false);
  const [dragged, setDragged] = useState<number | null>(null);

  const colorSizes = useMemo(() => colors.flatMap((color) => selectedSizes.map((size) => {
    const key = `${color.name}|${size}`;
    return { color, size, key, value: variants[key] ?? { sku: `${name.slice(0, 3).toUpperCase() || "SKU"}-${color.name.slice(0, 3).toUpperCase()}-${size}`, stock: 0, price: price || "0" } };
  })), [colors, selectedSizes, variants, name, price]);

  function updateVariant(key: string, patch: Partial<{ sku: string; stock: number; price: string }>) {
    setVariants((current) => ({ ...current, [key]: { ...(current[key] ?? { sku: "", stock: 0, price: price || "0" }), ...patch } }));
  }

  function addImage(files: FileList | null) {
    if (!files?.length) return;
    const additions = Array.from(files).slice(0, 6 - images.length).map((file) => ({ id: `placeholder:merchant-${file.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`, label: file.name }));
    setImages((current) => [...current, ...additions].slice(0, 6));
  }

  function renameColor(index: number, nextName: string) {
    const previous = colors[index]?.name;
    if (previous && previous !== nextName) {
      setVariants((current) => {
        const next = { ...current };
        for (const key of Object.keys(current)) {
          if (key.startsWith(`${previous}|`)) {
            next[`${nextName}|${key.slice(previous.length + 1)}`] = current[key]!;
            delete next[key];
          }
        }
        return next;
      });
    }
    setColors((current) => current.map((item, currentIndex) => currentIndex === index ? { ...item, name: nextName } : item));
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  }

  async function save(nextStatus: Product["status"] = status) {
    const sellingPrice = paise(price);
    const listPrice = paise(mrp);
    const payload: MerchantProductInput = {
      ...(initialProduct ? { id: initialProduct.id } : {}),
      name, categoryId, description, story,
      imageIds: images.map((image) => image.id),
      colors,
      sizes: selectedSizes,
      variants: colorSizes.map(({ color, size, value }) => ({ id: `${initialProduct?.id ?? "new"}-${color.name}-${size}`, color: color.name, colorHex: color.hex, size, sku: value.sku, stock: value.stock, price: paise(value.price) })),
      price: sellingPrice,
      mrp: listPrice,
      fabric, fit,
      care: careText.split("\n").map((line) => line.trim()).filter(Boolean),
      highlights: highlightsText.split("\n").map((line) => line.trim()).filter(Boolean),
      tags: tagsText.split(",").map((tag) => tag.trim()).filter(Boolean),
      seo: { title: seoTitle, description: seoDescription },
      status: nextStatus,
    };
    const parsed = merchantProductSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error("Check the product details", { description: parsed.error.issues[0]?.message ?? "Complete the required fields." });
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(initialProduct ? `/api/merchant/products/${initialProduct.id}` : "/api/merchant/products", {
        method: initialProduct ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await response.json() as { error?: string; product?: Product };
      if (!response.ok || !result.product) throw new Error(result.error ?? "Could not save this listing.");
      toast.success(nextStatus === "active" ? "Product published" : "Draft saved", { description: result.product.name });
      router.push("/merchant/products");
      router.refresh();
    } catch (error) {
      toast.error("Could not save product", { description: error instanceof Error ? error.message : "Please try again." });
    } finally { setBusy(false); }
  }

  const preview: Product = {
    id: initialProduct?.id ?? "preview",
    slug: initialProduct?.slug ?? "preview",
    name: name || "Your product name",
    description: description || "A considered piece by your label.",
    story: story || "Add the story behind your piece.",
    merchantId,
    categoryId,
    collectionIds: [],
    imageIds: images.map((image) => image.id),
    colors,
    sizes: selectedSizes,
    variants: colorSizes.map(({ color, size, key, value }) => ({ id: key, color: color.name, colorHex: color.hex, size, sku: value.sku, stock: value.stock, price: paise(value.price) })),
    price: paise(price || "0"),
    mrp: paise(mrp || price || "0"),
    fabric: fabric || "Fabric",
    fit: fit || "Fit",
    care: careText.split("\n").filter(Boolean),
    highlights: highlightsText.split("\n").filter(Boolean),
    tags: tagsText.split(",").map((tag) => tag.trim()).filter(Boolean),
    seo: { title: seoTitle || name || "Product title", description: seoDescription || description || "Product description" },
    rating: initialProduct?.rating ?? { average: 0, count: 0 },
    status,
  };

  return <div>
    <div className="mb-6 flex items-center justify-between gap-3"><div><p className="eyebrow">Catalogue</p><h2 className="display-md mt-1 text-indigo">{initialProduct ? "Edit product" : "Create product"}</h2></div><ButtonLink href="/merchant/products" variant="ghost"><ArrowLeft aria-hidden className="mr-2 size-4" />Back to products</ButtonLink></div>
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(17rem,0.7fr)]">
      <div className="space-y-5">
        <section className="space-y-4 border border-line p-4 sm:p-5"><h3 className="font-medium text-indigo">Product basics</h3><Input label="Product name" value={name} onChange={(event) => setName(event.target.value)} required /><Select label="Category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>{categories.filter((item) => item.parentId).map((item) => { const parent = categories.find((category) => category.id === item.parentId); return <option key={item.id} value={item.id}>{parent ? `${parent.name} · ${item.name}` : item.name}</option>; })}</Select><Textarea label="Short description" value={description} onChange={(event) => setDescription(event.target.value)} /><Textarea label="The story behind this piece" value={story} onChange={(event) => setStory(event.target.value)} /></section>
        <section className="border border-line p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><div><h3 className="font-medium text-indigo">Product imagery</h3><p className="caption mt-1">Add 3–6 images. Uploads are simulated as local placeholder previews.</p></div><label className="cursor-pointer text-sm text-indigo underline">Add images<input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => addImage(event.target.files)} /></label></div><ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{images.map((image, index) => <li key={image.id} draggable onDragStart={() => setDragged(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (dragged === null || dragged === index) return; setImages((current) => { const next = [...current]; const [item] = next.splice(dragged, 1); if (item) next.splice(index, 0, item); return next; }); setDragged(null); }} className="group border border-line p-2"><div className="relative"><MediaImage src={image.id} alt={image.label} ratio="4/5" sizes="(min-width: 640px) 25vw, 45vw" /><span className="absolute left-2 top-2 bg-ivory/90 p-1" title="Drag to reorder"><GripVertical aria-hidden className="size-4" /></span>{index === 0 ? <span className="absolute right-2 top-2 bg-indigo px-2 py-1 text-[10px] uppercase tracking-wide text-ivory">Cover</span> : null}</div><p className="mt-2 truncate text-xs">{image.label}</p><div className="mt-2 flex items-center justify-between"><div className="flex gap-1"><button type="button" aria-label={`Move image ${index + 1} earlier`} onClick={() => moveImage(index, -1)} className="p-1 text-muted"><ArrowUp aria-hidden className="size-4" /></button><button type="button" aria-label={`Move image ${index + 1} later`} onClick={() => moveImage(index, 1)} className="p-1 text-muted"><ArrowDown aria-hidden className="size-4" /></button></div><button type="button" aria-label={`Remove image ${index + 1}`} onClick={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="p-1 text-danger"><Trash2 aria-hidden className="size-4" /></button></div></li>)}</ul></section>
        <section className="space-y-4 border border-line p-4 sm:p-5"><h3 className="font-medium text-indigo">Variants & pricing</h3><div className="grid gap-4 sm:grid-cols-2"><Input label="Selling price (₹)" type="number" min="1" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} /><Input label="MRP (₹)" type="number" min="1" step="0.01" value={mrp} onChange={(event) => setMrp(event.target.value)} /><Input label="Fabric" value={fabric} onChange={(event) => setFabric(event.target.value)} /><Input label="Fit" value={fit} onChange={(event) => setFit(event.target.value)} /></div>
          <div><p className="mb-2 text-sm font-medium">Colours</p><div className="space-y-2">{colors.map((color, index) => <div key={`${color.name}-${index}`} className="grid grid-cols-[1fr_6rem_auto] gap-2"><Input aria-label={`Colour ${index + 1} name`} value={color.name} onChange={(event) => renameColor(index, event.target.value)} /><Input aria-label={`${color.name} colour hex`} value={color.hex} onChange={(event) => setColors((current) => current.map((item, currentIndex) => currentIndex === index ? { ...item, hex: event.target.value } : item))} /><Button type="button" size="sm" variant="quiet" aria-label={`Remove ${color.name}`} onClick={() => setColors((current) => current.filter((_, currentIndex) => currentIndex !== index))}><Trash2 aria-hidden className="size-4" /></Button></div>)}</div><Button type="button" size="sm" variant="ghost" className="mt-2" onClick={() => setColors((current) => [...current, { name: `Colour ${current.length + 1}`, hex: "#C9B89A" }])}><Plus aria-hidden className="mr-1 size-4" />Add colour</Button></div>
          <div><p className="mb-2 text-sm font-medium">Sizes</p><div className="flex flex-wrap gap-2">{sizes.map((size) => <label key={size} className="flex min-h-10 items-center gap-2 border border-line px-3 text-sm"><input type="checkbox" checked={selectedSizes.includes(size)} onChange={(event) => setSelectedSizes((current) => event.target.checked ? [...current, size] : current.filter((item) => item !== size))} />{size}</label>)}</div></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[36rem] text-left text-xs"><thead className="bg-pearl"><tr><th className="p-2">Colour / size</th><th className="p-2">SKU</th><th className="p-2">Stock</th><th className="p-2">Price (₹)</th></tr></thead><tbody>{colorSizes.map(({ color, size, key, value }) => <tr key={key} className="border-b border-line"><td className="p-2">{color.name} · {size}</td><td className="p-2"><input aria-label={`${color.name} ${size} SKU`} className="min-h-9 w-32 border border-line bg-ivory px-2" value={value.sku} onChange={(event) => updateVariant(key, { sku: event.target.value })} /></td><td className="p-2"><input aria-label={`${color.name} ${size} stock`} type="number" min="0" className="min-h-9 w-20 border border-line bg-ivory px-2" value={value.stock} onChange={(event) => updateVariant(key, { stock: Number(event.target.value) })} /></td><td className="p-2"><input aria-label={`${color.name} ${size} price`} type="number" min="1" step="0.01" className="min-h-9 w-24 border border-line bg-ivory px-2" value={value.price} onChange={(event) => updateVariant(key, { price: event.target.value })} /></td></tr>)}</tbody></table></div>
        </section>
        <section className="space-y-4 border border-line p-4 sm:p-5"><h3 className="font-medium text-indigo">Care, highlights & search</h3><Textarea label="Care instructions (one per line)" value={careText} onChange={(event) => setCareText(event.target.value)} /><Textarea label="Highlights (one per line)" value={highlightsText} onChange={(event) => setHighlightsText(event.target.value)} /><Input label="Tags (comma separated)" value={tagsText} onChange={(event) => setTagsText(event.target.value)} /><Input label="SEO title" value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} /><Textarea label="SEO description" value={seoDescription} onChange={(event) => setSeoDescription(event.target.value)} /></section>
      </div>
      <aside className="space-y-4 xl:sticky xl:top-6"><section className="border border-line p-4"><h3 className="mb-4 text-sm font-medium text-indigo">Live product-card preview</h3><div className="mx-auto max-w-[18rem]"><div inert aria-hidden className="pointer-events-none"><ProductCard product={preview} isNew={false} bestseller={false} merchantName={merchantName} /></div></div></section><section className="space-y-3 border border-line p-4"><Select label="Listing status" value={status} onChange={(event) => setStatus(event.target.value as Product["status"])}><option value="draft">Draft</option><option value="active">Published</option></Select><Button fullWidth loading={busy} onClick={() => save("draft")}>Save draft</Button><Button fullWidth variant="ghost" disabled={busy} onClick={() => save("active")}>Publish listing</Button><p className="caption">Only approved seller products can appear in the public catalogue.</p></section></aside>
    </div>
  </div>;
}
