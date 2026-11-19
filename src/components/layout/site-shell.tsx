import type { ReactNode } from "react";
import { getAdminAnnouncement, getAdminCategories, getAdminCollections } from "@/lib/admin-store";
import { getPublicDemoProducts } from "@/lib/demo-merchant-store";
import { AnnouncementBar } from "./announcement-bar";
import { CookieConsent } from "./cookie-consent";
import { MobileTabBar } from "./mobile-tab-bar";
import { ScrollToTop } from "./scroll-to-top";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function SiteShell({ children }: { children: ReactNode }) {
  const announcement = getAdminAnnouncement();
  const categories = getAdminCategories();
  const collections = getAdminCollections();
  const products = getPublicDemoProducts()
    .filter((product) => product.status === "active")
    .map(({ id, name, slug, tags }) => ({ id, name, slug, tags }));
  return (
    <>
      {announcement.active && announcement.offers.length ? <AnnouncementBar offers={announcement.offers} /> : null}
      <SiteHeader categories={categories} collections={collections} products={products} />
      <div className="pb-16 md:pb-0">{children}</div>
      <SiteFooter />
      <MobileTabBar />
      <CookieConsent />
      <ScrollToTop />
    </>
  );
}
