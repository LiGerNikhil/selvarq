import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { ContentManager } from "@/components/admin/content-manager";
import { getAdminAnnouncement, getAdminBanners, getAdminCollections, getAdminStories } from "@/lib/admin-store";

export const metadata: Metadata = { title: "Homepage content" };

export default function AdminContentPage() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Storefront"
        title="Homepage CMS"
        description="Hero banners, journal stories, featured collections and the announcement bar all read from this demo store."
      />
      <ContentManager
        banners={getAdminBanners()}
        stories={getAdminStories()}
        collections={getAdminCollections()}
        announcement={getAdminAnnouncement()}
      />
    </>
  );
}