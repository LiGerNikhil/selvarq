import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { CatalogManager } from "@/components/admin/catalog-manager";
import { getAdminCategories, getAdminCollections } from "@/lib/admin-store";

export const metadata: Metadata = { title: "Catalog manager" };

export default function AdminCatalogPage() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Categories & collections"
        description="Public navigation and collection pages read these records. Descriptions are required so listings stay editorial."
      />
      <CatalogManager categories={getAdminCategories()} collections={getAdminCollections()} />
    </>
  );
}