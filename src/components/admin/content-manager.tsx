"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { Banner, Story } from "@/data";
import type { AdminAnnouncement, AdminCollection } from "@/lib/admin-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AdminSection } from "@/components/admin/admin-ui";
import { toast } from "@/store/toast-store";
import { formatDate } from "@/lib/format";

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const emptyBanner = { id: undefined as string | undefined, title: "", subtitle: "", imageId: "", href: "/shop", placement: "hero" as Banner["placement"], active: true };
const emptyStory = { id: undefined as string | undefined, title: "", slug: "", excerpt: "", body: "", imageId: "", publishedAt: new Date().toISOString().slice(0, 10), tags: "" };

async function postContent(kind: string, data: Record<string, unknown>) {
  const response = await fetch("/api/admin/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, data }),
  });
  const result = await response.json() as { error?: string };
  if (!response.ok) throw new Error(result.error ?? "Could not save this content.");
}

async function deleteContent(kind: string, id: string) {
  const response = await fetch("/api/admin/content", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, id }),
  });
  const result = await response.json() as { error?: string };
  if (!response.ok) throw new Error(result.error ?? "Could not delete this content.");
}

export function ContentManager({
  banners,
  stories,
  collections,
  announcement,
}: {
  banners: Banner[];
  stories: Story[];
  collections: AdminCollection[];
  announcement: AdminAnnouncement;
}) {
  const router = useRouter();
  const [banner, setBanner] = useState(emptyBanner);
  const [story, setStory] = useState(emptyStory);
  const [offers, setOffers] = useState(announcement.offers);
  const [announcementActive, setAnnouncementActive] = useState(announcement.active);
  const [featured, setFeatured] = useState<Record<string, boolean>>(() => Object.fromEntries(collections.map((collection) => [collection.id, collection.featured])));
  const [busy, setBusy] = useState("");

  function editBanner(item: Banner) {
    setBanner({ id: item.id, title: item.title, subtitle: item.subtitle, imageId: item.imageId, href: item.href, placement: item.placement, active: item.active });
  }

  function editStory(item: Story) {
    setStory({ id: item.id, title: item.title, slug: item.slug, excerpt: item.excerpt, body: item.body, imageId: item.imageId, publishedAt: item.publishedAt.slice(0, 10), tags: item.tags.join(", ") });
  }

  async function submitBanner() {
    setBusy("banner");
    try {
      await postContent("banner", {
        ...(banner.id ? { id: banner.id } : {}),
        title: banner.title,
        subtitle: banner.subtitle,
        imageId: banner.imageId || `placeholder:${slugify(banner.title) || "banner"}`,
        href: banner.href || "/shop",
        placement: banner.placement,
        active: banner.active,
      });
      toast.success(banner.id ? "Banner updated" : "Banner added", { description: banner.active ? "Live on the storefront." : "Saved as inactive." });
      setBanner(emptyBanner);
      router.refresh();
    } catch (error) {
      toast.error("Could not save banner", { description: error instanceof Error ? error.message : "Please try again." });
    } finally { setBusy(""); }
  }

  async function submitStory() {
    setBusy("story");
    try {
      await postContent("story", {
        ...(story.id ? { id: story.id } : {}),
        title: story.title,
        slug: story.slug || slugify(story.title),
        excerpt: story.excerpt,
        body: story.body,
        imageId: story.imageId || `placeholder:${slugify(story.title) || "story"}`,
        publishedAt: `${story.publishedAt.slice(0, 10)}T00:00:00.000Z`,
        tags: story.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      });
      toast.success(story.id ? "Story updated" : "Story published");
      setStory(emptyStory);
      router.refresh();
    } catch (error) {
      toast.error("Could not save story", { description: error instanceof Error ? error.message : "Please try again." });
    } finally { setBusy(""); }
  }

  async function submitAnnouncement() {
    setBusy("announcement");
    try {
      await postContent("announcement", { active: announcementActive, offers: offers.map((offer) => ({ ...(offer.id ? { id: offer.id } : {}), text: offer.text, href: offer.href })) });
      toast.success("Announcement bar updated");
      router.refresh();
    } catch (error) {
      toast.error("Could not save announcement", { description: error instanceof Error ? error.message : "Please try again." });
    } finally { setBusy(""); }
  }

  async function submitFeatured() {
    setBusy("featured");
    try {
      for (const collection of collections) {
        if (featured[collection.id] === collection.featured) continue;
        await postContent("collection", { ...collection, featured: featured[collection.id] });
      }
      toast.success("Featured collections updated");
      router.refresh();
    } catch (error) {
      toast.error("Could not update featured collections", { description: error instanceof Error ? error.message : "Please try again." });
    } finally { setBusy(""); }
  }

  async function removeBanner(id: string, title: string) {
    if (!window.confirm(`Delete banner “${title}”?`)) return;
    try { await deleteContent("banner", id); toast.success("Banner deleted"); if (banner.id === id) setBanner(emptyBanner); router.refresh(); }
    catch (error) { toast.error("Could not delete banner", { description: error instanceof Error ? error.message : "Please try again." }); }
  }

  async function removeStory(id: string, title: string) {
    if (!window.confirm(`Delete story “${title}”?`)) return;
    try { await deleteContent("story", id); toast.success("Story deleted"); if (story.id === id) setStory(emptyStory); router.refresh(); }
    catch (error) { toast.error("Could not delete story", { description: error instanceof Error ? error.message : "Please try again." }); }
  }

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 xl:grid-cols-2">
        <AdminSection title="Hero & campaign banners" description={`${banners.length} banners · active hero entries rotate on the homepage`}>
          <ul className="max-h-72 divide-y divide-line overflow-y-auto">
            {banners.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-indigo">{item.title}</p>
                  <p className="caption truncate">{item.placement} · {item.href}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Badge variant={item.active ? "success" : "outline"}>{item.active ? "Live" : "Off"}</Badge>
                  <Button size="sm" variant="quiet" aria-label={`Edit ${item.title}`} onClick={() => editBanner(item)}><Pencil aria-hidden className="size-4" /></Button>
                  <Button size="sm" variant="quiet" aria-label={`Delete ${item.title}`} onClick={() => removeBanner(item.id, item.title)}><Trash2 aria-hidden className="size-4" /></Button>
                </div>
              </li>
            ))}
          </ul>
          <div className="space-y-3 border-t border-line p-4">
            <p className="text-sm font-medium text-indigo">{banner.id ? "Edit banner" : "New banner"}</p>
            <Input label="Title" value={banner.title} onChange={(event) => setBanner({ ...banner, title: event.target.value })} />
            <Input label="Subtitle" value={banner.subtitle} onChange={(event) => setBanner({ ...banner, subtitle: event.target.value })} />
            <ImageUploader
              value={banner.imageId ? [banner.imageId] : []}
              onChange={(ids) => setBanner({ ...banner, imageId: ids[0] ?? "" })}
              folder="banners"
              max={1}
              ratio="16/9"
              title="Banner image"
              allowUrl
              hint="Wide art works best. Leave empty to keep a generated placeholder."
            />
            <Input label="Link" value={banner.href} onChange={(event) => setBanner({ ...banner, href: event.target.value })} />
            <Select label="Placement" value={banner.placement} onChange={(event) => setBanner({ ...banner, placement: event.target.value as Banner["placement"] })}>
              <option value="hero">Hero</option>
              <option value="campaign">Campaign</option>
              <option value="category">Category</option>
            </Select>
            <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-indigo" checked={banner.active} onChange={(event) => setBanner({ ...banner, active: event.target.checked })} />Active</label>
            <div className="flex gap-2">
              <Button size="sm" loading={busy === "banner"} onClick={submitBanner}>{banner.id ? "Save banner" : "Add banner"}</Button>
              {banner.id ? <Button size="sm" variant="ghost" onClick={() => setBanner(emptyBanner)}>Cancel</Button> : null}
            </div>
          </div>
        </AdminSection>

        <AdminSection title="Journal stories" description={`${stories.length} stories · newest appear on the homepage`}>
          <ul className="max-h-72 divide-y divide-line overflow-y-auto">
            {stories.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-indigo">{item.title}</p>
                  <p className="caption truncate">{formatDate(item.publishedAt)} · {item.tags.slice(0, 2).join(", ")}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button size="sm" variant="quiet" aria-label={`Edit ${item.title}`} onClick={() => editStory(item)}><Pencil aria-hidden className="size-4" /></Button>
                  <Button size="sm" variant="quiet" aria-label={`Delete ${item.title}`} onClick={() => removeStory(item.id, item.title)}><Trash2 aria-hidden className="size-4" /></Button>
                </div>
              </li>
            ))}
          </ul>
          <div className="space-y-3 border-t border-line p-4">
            <p className="text-sm font-medium text-indigo">{story.id ? "Edit story" : "New story"}</p>
            <Input label="Title" value={story.title} onChange={(event) => setStory({ ...story, title: event.target.value })} />
            <Input label="Slug" value={story.slug} onChange={(event) => setStory({ ...story, slug: event.target.value })} placeholder={slugify(story.title)} />
            <ImageUploader
              value={story.imageId ? [story.imageId] : []}
              onChange={(ids) => setStory({ ...story, imageId: ids[0] ?? "" })}
              folder="stories"
              max={1}
              ratio="16/9"
              title="Story image"
              allowUrl
              hint="Used on the journal card and article header."
            />
            <Input label="Published" type="date" value={story.publishedAt} onChange={(event) => setStory({ ...story, publishedAt: event.target.value })} />
            <Input label="Tags" hint="Comma separated, up to 8." value={story.tags} onChange={(event) => setStory({ ...story, tags: event.target.value })} />
            <Textarea label="Excerpt" value={story.excerpt} onChange={(event) => setStory({ ...story, excerpt: event.target.value })} rows={2} />
            <Textarea label="Body" value={story.body} onChange={(event) => setStory({ ...story, body: event.target.value })} rows={5} />
            <div className="flex gap-2">
              <Button size="sm" loading={busy === "story"} onClick={submitStory}>{story.id ? "Save story" : "Publish story"}</Button>
              {story.id ? <Button size="sm" variant="ghost" onClick={() => setStory(emptyStory)}>Cancel</Button> : null}
            </div>
          </div>
        </AdminSection>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-2">
        <AdminSection title="Featured collections" description="Homepage collection carousel order follows this list">
          <ul className="divide-y divide-line">
            {collections.map((collection) => (
              <li key={collection.id} className="p-3">
                <label className="flex min-h-11 items-center justify-between gap-3 text-sm">
                  <span>
                    <span className="font-medium text-indigo">{collection.name}</span>
                    <span className="caption mt-1 block">{collection.productIds.length} products</span>
                  </span>
                  <input type="checkbox" className="size-4 accent-indigo" checked={featured[collection.id] ?? false} onChange={(event) => setFeatured({ ...featured, [collection.id]: event.target.checked })} />
                </label>
              </li>
            ))}
          </ul>
          <div className="border-t border-line p-4"><Button size="sm" loading={busy === "featured"} onClick={submitFeatured}>Save featured selection</Button></div>
        </AdminSection>

        <AdminSection title="Announcement bar" description="Up to 5 offers rotate above the header">
          <div className="space-y-3 p-4">
            <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-indigo" checked={announcementActive} onChange={(event) => setAnnouncementActive(event.target.checked)} />Show the announcement bar</label>
            {offers.map((offer, index) => (
              <div key={offer.id ?? index} className="space-y-2 border border-line p-3">
                <Input label={`Offer ${index + 1}`} value={offer.text} onChange={(event) => setOffers(offers.map((item, itemIndex) => itemIndex === index ? { ...item, text: event.target.value } : item))} />
                <Input label="Link" value={offer.href} onChange={(event) => setOffers(offers.map((item, itemIndex) => itemIndex === index ? { ...item, href: event.target.value } : item))} />
                <Button size="sm" variant="quiet" aria-label={`Remove offer ${index + 1}`} onClick={() => setOffers(offers.filter((_, itemIndex) => itemIndex !== index))}><Trash2 aria-hidden className="mr-1 size-4" />Remove</Button>
              </div>
            ))}
            {offers.length < 5 ? <Button size="sm" variant="ghost" onClick={() => setOffers([...offers, { id: crypto.randomUUID(), text: "", href: "/shop" }])}><Plus aria-hidden className="mr-1 size-4" />Add offer</Button> : null}
            <Button loading={busy === "announcement"} onClick={submitAnnouncement}>Save announcement</Button>
          </div>
        </AdminSection>
      </div>
    </div>
  );
}