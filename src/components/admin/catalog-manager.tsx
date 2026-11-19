"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import type { Category } from "@/data";
import type { AdminCollection } from "@/lib/admin-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AdminSection } from "@/components/admin/admin-ui";
import { toast } from "@/store/toast-store";
import { formatNumber } from "@/lib/format";

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function save(kind: "category" | "collection", data: Record<string, unknown>) {
  const response = await fetch("/api/admin/catalog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, data }),
  });
  const result = await response.json() as { error?: string };
  if (!response.ok) throw new Error(result.error ?? "Could not save this record.");
}

async function remove(kind: "category" | "collection", id: string) {
  const response = await fetch("/api/admin/catalog", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, id }),
  });
  const result = await response.json() as { error?: string };
  if (!response.ok) throw new Error(result.error ?? "Could not delete this record.");
}

const emptyCategory = { id: undefined as string | undefined, name: "", slug: "", parentId: "", description: "", imageId: "" };
const emptyCollection = { id: undefined as string | undefined, name: "", slug: "", description: "", imageId: "", featured: false };

export function CatalogManager({ categories, collections }: { categories: Category[]; collections: AdminCollection[] }) {
  const router = useRouter();
  const [category, setCategory] = useState(emptyCategory);
  const [collection, setCollection] = useState(emptyCollection);
  const [busy, setBusy] = useState("");

  function editCategory(item: Category) {
    setCategory({ id: item.id, name: item.name, slug: item.slug, parentId: item.parentId ?? "", description: item.description, imageId: item.imageId ?? "" });
  }

  function editCollection(item: AdminCollection) {
    setCollection({ id: item.id, name: item.name, slug: item.slug, description: item.description, imageId: item.imageId, featured: item.featured });
  }

  async function submitCategory() {
    setBusy("category");
    try {
      await save("category", {
        ...(category.id ? { id: category.id } : {}),
        name: category.name,
        slug: category.slug || slugify(category.name),
        parentId: category.parentId || null,
        description: category.description,
        ...(category.imageId ? { imageId: category.imageId } : {}),
      });
      toast.success(category.id ? "Category updated" : "Category created");
      setCategory(emptyCategory);
      router.refresh();
    } catch (error) {
      toast.error("Could not save category", { description: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setBusy("");
    }
  }

  async function submitCollection() {
    setBusy("collection");
    try {
      await save("collection", {
        ...(collection.id ? { id: collection.id } : {}),
        name: collection.name,
        slug: collection.slug || slugify(collection.name),
        description: collection.description,
        imageId: collection.imageId || `placeholder:${slugify(collection.name) || "collection"}`,
        featured: collection.featured,
      });
      toast.success(collection.id ? "Collection updated" : "Collection created");
      setCollection(emptyCollection);
      router.refresh();
    } catch (error) {
      toast.error("Could not save collection", { description: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setBusy("");
    }
  }

  async function deleteCategory(id: string, name: string) {
    if (!window.confirm(`Delete category “${name}”?`)) return;
    try {
      await remove("category", id);
      toast.success("Category deleted");
      if (category.id === id) setCategory(emptyCategory);
      router.refresh();
    } catch (error) {
      toast.error("Could not delete category", { description: error instanceof Error ? error.message : "Please try again." });
    }
  }

  async function deleteCollection(id: string, name: string) {
    if (!window.confirm(`Delete collection “${name}”?`)) return;
    try {
      await remove("collection", id);
      toast.success("Collection deleted");
      if (collection.id === id) setCollection(emptyCollection);
      router.refresh();
    } catch (error) {
      toast.error("Could not delete collection", { description: error instanceof Error ? error.message : "Please try again." });
    }
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-2">
      <AdminSection title="Categories" description={`${categories.length} categories · edit or add a new one`}>
        <ul className="max-h-80 divide-y divide-line overflow-y-auto">
          {categories.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-indigo">{item.name}</p>
                <p className="caption truncate">{item.slug}{item.parentId ? ` · child of ${categories.find((parent) => parent.id === item.parentId)?.name ?? item.parentId}` : " · top level"}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button size="sm" variant="quiet" aria-label={`Edit ${item.name}`} onClick={() => editCategory(item)}><Pencil aria-hidden className="size-4" /></Button>
                <Button size="sm" variant="quiet" aria-label={`Delete ${item.name}`} onClick={() => deleteCategory(item.id, item.name)}><Trash2 aria-hidden className="size-4" /></Button>
              </div>
            </li>
          ))}
        </ul>
        <div className="space-y-3 border-t border-line p-4">
          <p className="text-sm font-medium text-indigo">{category.id ? "Edit category" : "New category"}</p>
          <Input label="Name" value={category.name} onChange={(event) => setCategory({ ...category, name: event.target.value })} />
          <Input label="Slug" hint="Lowercase letters, numbers and hyphens." value={category.slug} onChange={(event) => setCategory({ ...category, slug: event.target.value })} placeholder={slugify(category.name)} />
          <Select label="Parent" value={category.parentId} onChange={(event) => setCategory({ ...category, parentId: event.target.value })}>
            <option value="">Top level</option>
            {categories.filter((item) => item.id !== category.id && !item.parentId).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </Select>
          <Textarea label="Description" value={category.description} onChange={(event) => setCategory({ ...category, description: event.target.value })} rows={3} />
          <ImageUploader
            value={category.imageId ? [category.imageId] : []}
            onChange={(ids) => setCategory({ ...category, imageId: ids[0] ?? "" })}
            folder="categories"
            max={1}
            ratio="16/9"
            title="Category image"
            allowUrl
            hint="Optional. When empty, the first product image in this category is used."
          />
          <div className="flex gap-2">
            <Button size="sm" loading={busy === "category"} onClick={submitCategory}>{category.id ? "Save category" : "Add category"}</Button>
            {category.id ? <Button size="sm" variant="ghost" onClick={() => setCategory(emptyCategory)}>Cancel</Button> : null}
          </div>
        </div>
      </AdminSection>

      <AdminSection title="Collections" description={`${collections.length} collections · featured ones appear on the homepage`}>
        <ul className="max-h-80 divide-y divide-line overflow-y-auto">
          {collections.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-indigo">{item.name}</p>
                <p className="caption truncate">{formatNumber(item.productIds.length)} products · {item.featured ? "featured" : "not featured"}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button size="sm" variant="quiet" aria-label={`Edit ${item.name}`} onClick={() => editCollection(item)}><Pencil aria-hidden className="size-4" /></Button>
                <Button size="sm" variant="quiet" aria-label={`Delete ${item.name}`} onClick={() => deleteCollection(item.id, item.name)}><Trash2 aria-hidden className="size-4" /></Button>
              </div>
            </li>
          ))}
        </ul>
        <div className="space-y-3 border-t border-line p-4">
          <p className="text-sm font-medium text-indigo">{collection.id ? "Edit collection" : "New collection"}</p>
          <Input label="Name" value={collection.name} onChange={(event) => setCollection({ ...collection, name: event.target.value })} />
          <Input label="Slug" hint="Lowercase letters, numbers and hyphens." value={collection.slug} onChange={(event) => setCollection({ ...collection, slug: event.target.value })} placeholder={slugify(collection.name)} />
          <ImageUploader
            value={collection.imageId ? [collection.imageId] : []}
            onChange={(ids) => setCollection({ ...collection, imageId: ids[0] ?? "" })}
            folder="collections"
            max={1}
            ratio="16/9"
            title="Collection image"
            allowUrl
            hint="Uploaded to Cloudinary. Leave empty to keep a generated placeholder."
          />
          <Textarea label="Description" value={collection.description} onChange={(event) => setCollection({ ...collection, description: event.target.value })} rows={3} />
          <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-indigo" checked={collection.featured} onChange={(event) => setCollection({ ...collection, featured: event.target.checked })} />Feature on the homepage</label>
          <div className="flex gap-2">
            <Button size="sm" loading={busy === "collection"} onClick={submitCollection}>{collection.id ? "Save collection" : "Add collection"}</Button>
            {collection.id ? <Button size="sm" variant="ghost" onClick={() => setCollection(emptyCollection)}>Cancel</Button> : null}
          </div>
        </div>
      </AdminSection>
    </div>
  );
}