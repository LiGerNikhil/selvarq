import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/toast";
import { SiteShell } from "@/components/layout/site-shell";
import { BRAND } from "@/lib/config";
import { SITE_URL } from "@/lib/seo";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${BRAND.name} | ${BRAND.tagline}`, template: `%s | ${BRAND.name}` },
  description:
    "Premium clothing for India, cut with intent and finished to last. Made by makers, chosen by us.",
  applicationName: BRAND.name,
  openGraph: { siteName: BRAND.name, locale: "en_IN", type: "website" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets content extend under notches; we pad with env(safe-area-inset-*).
  viewportFit: "cover",
  themeColor: "#FAF7F2",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={fontVariables}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-ui focus:bg-indigo focus:px-4 focus:py-3 focus:text-sm focus:text-ivory"
        >
          Skip to content
        </a>
        <SiteShell>
          <div id="main">{children}</div>
        </SiteShell>
        <Toaster />
      </body>
    </html>
  );
}
