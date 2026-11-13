import type { ReactNode } from "react";
import { AnnouncementBar } from "./announcement-bar";
import { CookieConsent } from "./cookie-consent";
import { MobileTabBar } from "./mobile-tab-bar";
import { ScrollToTop } from "./scroll-to-top";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <div className="pb-16 md:pb-0">{children}</div>
      <SiteFooter />
      <MobileTabBar />
      <CookieConsent />
      <ScrollToTop />
    </>
  );
}
