"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Trash2 } from "lucide-react";
import type { Product } from "@/data";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaImage } from "@/components/ui/media-image";
import { Select } from "@/components/ui/select";
import { formatINR } from "@/lib/format";

export function MerchantProductList({ products }: { products: Product[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const filtered = useMemo(() => products.filter((product) =>
    (!query || `${product.name} ${product.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase()))
    && (status === "all" || product.status === status)), [products, query, status]);

  async function bulk(action: "publish" | "draft" | "delete") {
    if (!selected.length) return;
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/merchant/products", {
        method: action === "delete" ? "DELETE" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "delete" ? { ids: selected } : { ids: selected, status: action === "publish" ? "active" : "draft" }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not update selected products.");
      setSelected([]);
      setNotice(action === "delete" ? "Selected listings removed." : `Selected listings saved as ${action === "publish" ? "published" : "draft"}.`);
      router.refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not update selected products.");
    } finally { setBusy(false); }
  }

  return <div className="mt-6">
    <div className="flex flex-col gap-3 sm:flex-row"><Input aria-label="Search products" placeholder="Search products" value={query} onChange={(event) => setQuery(event.target.value)} className="sm:max-w-sm" /><Select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)} className="sm:max-w-48"><option value="all">All statuses</option><option value="active">Published</option><option value="draft">Draft</option></Select><ButtonLink href="/merchant/products/new" className="sm:ml-auto"><Plus aria-hidden className="mr-2 size-4" />Add product</ButtonLink></div>
    {selected.length ? <div className="mt-4 flex flex-wrap items-center gap-2 border border-line bg-pearl p-3"><span className="mr-auto text-sm">{selected.length} selected</span><Button size="sm" variant="ghost" disabled={busy} onClick={() => bulk("publish")}>Publish</Button><Button size="sm" variant="ghost" disabled={busy} onClick={() => bulk("draft")}>Move to drafts</Button><Button size="sm" variant="danger" disabled={busy} onClick={() => bulk("delete")}><Trash2 aria-hidden className="mr-1 size-4" />Delete</Button></div> : null}
    {notice ? <p role="status" className="mt-3 text-sm text-indigo">{notice}</p> : null}
    {filtered.length ? <div className="mt-4 overflow-x-auto border border-line"><table className="w-full min-w-[42rem] text-left text-sm"><thead className="bg-pearl text-xs uppercase tracking-wide text-muted"><tr><th className="p-3"><input type="checkbox" aria-label="Select all visible products" checked={filtered.length > 0 && filtered.every((product) => selected.includes(product.id))} onChange={(event) => setSelected(event.target.checked ? [...new Set([...selected, ...filtered.map((product) => product.id)])] : selected.filter((id) => !filtered.some((product) => product.id === id)))} /></th><th className="p-3">Product</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Status</th><th className="p-3">Edit</th></tr></thead><tbody className="divide-y divide-line">{filtered.map((product) => <tr key={product.id}><td className="p-3"><input type="checkbox" aria-label={`Select ${product.name}`} checked={selected.includes(product.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, product.id] : current.filter((id) => id !== product.id))} /></td><td className="p-3"><div className="flex items-center gap-3"><div className="w-12 shrink-0"><MediaImage src={product.imageIds[0]} alt="" ratio="4/5" sizes="48px" /></div><div><Link href={`/product/${product.slug}`} className="font-medium text-indigo hover:underline">{product.name}</Link><p className="caption mt-1">{product.fabric} · {product.fit}</p></div></div></td><td className="p-3">{formatINR(product.price)}</td><td className="p-3">{product.variants.reduce((total, variant) => total + variant.stock, 0)}</td><td className="p-3"><Badge variant={product.status === "active" ? "success" : "outline"}>{product.status}</Badge></td><td className="p-3"><Link href={`/merchant/products/${product.id}/edit`} className="text-indigo underline">Edit</Link></td></tr>)}</tbody></table></div> : <div className="mt-5 border border-dashed border-line p-8 text-center"><Search aria-hidden className="mx-auto size-5 text-muted" /><p className="mt-3 text-sm font-medium">No products match your search.</p><p className="caption mt-1">Try another term or create your first listing.</p></div>}
  </div>;
}
