# SELVARQ: project context (stable facts)

Read this and PROGRESS.md at the start of every phase. Do not re-read the codebase; use ls, grep, targeted reads.

## Brand
- SELVARQ, premium multi-vendor fashion marketplace for India. INR, locale en-IN.
- Tagline "Premium Clothing." Footer line "SELVARQ, a brand of Sharda Garments."
- Own catalogue sold by Sharda Garments (seller id `sharda-garments`). Approved merchants can list their own.
- Voice: warm, confident, concise, craft-led. Product copy always names fabric, fit, care. No filler, no emoji in UI.
- Microcopy lives in `src/data/copy.ts`. Commerce constants live in `src/lib/config.ts`.

## Stack
Next.js 16.4.6 (App Router, Turbopack), React 19, TypeScript strict, Tailwind v4, zod, react-hook-form + @hookform/resolvers, zustand, framer-motion (toast only so far), lucide-react, clsx, tailwind-merge, date-fns, embla-carousel-react, cloudinary (server-side uploads), mongoose (MongoDB persistence).
P13: signed auth (jose, bcryptjs) still pending. Do not install those before the auth scope is confirmed.
Next 16 rules: `await params` / `await searchParams`; `proxy.ts` (not middleware.ts); remote images via `images.remotePatterns`; Server Components by default; Server Actions or Route Handlers for mutations; lint via `eslint` (no `next lint`).

## Design tokens (globals.css; Tailwind classes use the same names)
ivory #FAF7F2 (page) | pearl #F3EEE6 (cards) | indigo #1F2A6B (primary) | indigo-deep #141C4A (hover, footer) | gold #B8923A (hairlines, icons, focus) | gold-soft #E9DDBF (badges) | burgundy #6B1F3A (sale only) | ink #1A1A2E (body) | muted #6B6B80 | line #E6DFD2 | success #2F6B4F | danger #A3262B.
Added, derived: `gold-ink` #8A6A1F, gold as TEXT on light backgrounds (gold itself fails AA as text).
Other tokens: `rounded-ui` 2px, `shadow-float` (floating layers only), `tracking-brand` 0.14em, `tracking-display` 0.08em.
Fonts (next/font in `src/lib/fonts.ts`): Cormorant Garamond = `font-display`, Jost = `font-sans`.
Type utilities: `display-xl|lg|md` (uppercase, 0.08 to 0.12em), `eyebrow` (gold-ink), `body`, `caption` (muted).
Layout utilities: `page-container` (max 80rem, 16px/32px gutters), `pb-safe`, `pt-safe`.
Motion 200 to 400 ms ease-out; reduced motion collapses durations globally.

## Folder structure
```
src/app/            routes (+ styleguide/_sections/*)
src/components/     ui/ layout/ product/ home/ listing/ account/ merchant/ admin/
src/lib/            config.ts format.ts utils.ts env.ts media.ts fonts.ts  repo/ db/
src/data/           copy.ts, stories.ts (brand story chapters), homepage.ts, mock fixtures
src/store/          toast-store.ts, cart/wishlist/ui/recently-viewed stores
src/types/          common user merchant catalog review order marketing index
src/hooks/          use-modal-dialog.ts
src/styles/         overlays.css (native <dialog> motion for Sheet + Dialog)
public/brand/       Selvarq-logo.png, monogram.png, og-default.png (auto-detected logo/monogram)
```

## Conventions
- Files under ~250 lines. Kebab-case file names, PascalCase components, named exports (default only for Next route files).
- Money = integer paise (`Paise`). Dates = ISO strings. Format only via `src/lib/format.ts`.
- Prices are GST-inclusive in the UI; GST breakup at checkout and on invoices.
- Every image goes through `<MediaImage>`. Seed data uses `placeholder:<seed>` ids (generated art, no network); uploaded media uses a Cloudinary public id, and pasted external links are imported to Cloudinary before they are stored.
- `placeholder:` ids are served locally by `/api/placeholder/[id]` as branded SVG tiles. Cloudinary uploads are handled by `/api/uploads`; never expose the API secret to the browser.
- `resolveMediaSrc` maps a public id to a Cloudinary delivery URL (`f_auto,q_auto`); `resolveShareImage` is the OG/JSON-LD gate that rejects SVG placeholders.
- Class merging via `cn()`. Forms: react-hook-form + zod schema; map errors to the `error` prop of inputs.
- Data-driven routes get `loading.tsx`; `error.tsx` where relevant; branded `not-found.tsx`. Static information pages intentionally have no loading boundary. The home skeleton lives in `src/app/(home)/loading.tsx`, not the root, so prerendered pages are not wrapped in a Suspense boundary.
- Env: `DATA_SOURCE=mock|mongo` (validated in `src/lib/env.ts`), `NEXT_PUBLIC_DATA_SOURCE` (mirror of `DATA_SOURCE` for client bundles; keep in sync), `MONGODB_URI`, `MONGODB_DB` (default `selvarq`), `SEED_DEMO_DATA`, `SEED_ADMIN_*`, `SEED_SELLER_*`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

## P1 mock data
- Typed fixtures are exported from `src/data/index.ts`; data is split by domain under `src/data/`.
- The seed catalogue includes four department roots and the listed subcategories, six collections, seven merchants, 48 products, 120 reviews, five users, six coupons, four stories, four banners, 12 FAQs and 20 orders.
- Product and merchant imagery uses `placeholder:<seed>` identifiers rendered by `/api/placeholder/[id]`; no external image URLs are used.

## UI primitives (src/components/ui), props summary
- `Button` variant primary|ghost|quiet|danger, size sm|md|lg, loading, leftIcon, rightIcon, fullWidth. `ButtonLink` same styles on next/link. `buttonStyles()` for custom elements.
- `Input` / `Textarea` / `Select`: label, hint, error (+ native props; pass type, inputMode, autoComplete). `Checkbox` (label, description, error). `Radio`, `RadioGroup` (legend, name, options, value|defaultValue, onValueChange).
- `Badge` variant neutral|gold|indigo|sale|success|danger|outline. `Rating` (value, count, size, showValue), `RatingInput` (value, onChange). `Skeleton`, `SkeletonText`, `SkeletonCard`.
- `Sheet` (open, onOpenChange, title, description, footer, side responsive|right|left|bottom), `Dialog` (open, onOpenChange, title, description, footer, size). Both native `<dialog>` via `useModalDialog`.
- `Tabs` (items, label), `Accordion` (items, type single|multiple, defaultOpen, headingLevel), `Breadcrumbs` (items).
- `Toaster` (mount once, done in root layout) and `toast.show|success|error|info(title, {description, duration})`.
- `Price` (price, mrp, size, showTaxNote), `QuantityStepper` (value, onChange, min, max), `Logo` (variant wordmark|monogram, size, tone, href, preload), `MediaImage` (src, alt, ratio, sizes, preload, fit).
- Shared `ProductCard` lives in `src/components/product/product-card.tsx`; use it across home, listing, wishlist and related-product surfaces.

## Route map
Built: global responsive shell (announcement, header, menus, search/cart overlays, mobile tabs, footer, consent and scroll-to-top), `/` (editorial homepage with a preference-personalized “For you” rail), `/shop`, `/category/[slug]`, `/collection/[slug]`, `/search`, `/product/[slug]`, `/cart`, `/wishlist`, `/checkout`, `/order/[id]/confirmation`, `/merchant/[slug]/store` (public approved-maker storefront), `/sell` (seller landing), `/merchant` (dashboard redirect), `/merchant/register`, `/merchant/pending`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/onboarding`, `/account` (profile, addresses, orders, order details/tracking, printable invoices, wishlist, reviews, notifications, preferences), `/merchant/dashboard`, `/merchant/products`, `/merchant/products/new`, `/merchant/products/[id]/edit`, `/merchant/orders`, `/merchant/payouts`, `/merchant/profile`, `/merchant/notifications`, `/admin` (dashboard, merchants, commissions, moderation, products CRUD, catalog, content, orders, payouts, coupons, reviews, users, settings), the information pages `/about`, `/contact`, `/shipping`, `/returns`, `/privacy`, `/terms`, `/size-guide`, `/faq` and `/track`, the journal `/stories` and `/stories/[slug]`, plus `/styleguide` (noindex). `/c/[slug]`, `/collections/[slug]`, and `/p/[slug]` redirect to canonical category, collection, and product routes. Home keeps its own loading skeleton; data-driven routes include branded loading states; root `error.tsx`, admin `loading.tsx`/`error.tsx` and `not-found.tsx` provide branded route states.
Planned: `/orders/[id]` and signed auth.

## Data model summary (src/types)
User(role customer|merchant|admin, addresses, wishlist) | Address | Merchant(status pending|approved|rejected|suspended, gstDeclaration, gstin?, pan, bank, pickupAddress, documents, commissionRate) | Category(parentId) | Collection(productIds) | Product(merchantId, categoryId, fabric, fit, care[], variants[], price, mrp, rating, status) | Variant(size, color, stock, sku) | Review | Cart/CartItem(merchantId for grouping) | Order(items, merchantOrders[], totals, payment) | OrderItem(price, GST and commission snapshots) | MerchantOrder (per-seller split: payout, tracking) | Coupon | Story | Banner.

## Commerce rules (src/lib/config.ts)
Commission default 12% per order line, editable per merchant. GST slabs configurable: 5% up to Rs 2,500 per piece (inclusive bound), 18% above; `gstRateFor(price)`. Free delivery at or above Rs 1,999. Placeholders to confirm: standard shipping fee Rs 99, delivery 3 to 7 days. Return window 7 days. Only approved merchants publish; admin products sold by Sharda Garments. Cart grouped by seller; orders split per merchant.

## Repo-layer API (`src/lib/repo/*`)
- Select repositories from `repositories` in `src/lib/repo/index.ts`; direct named exports are `productsRepository`, `categoriesRepository`, `collectionsRepository`, `merchantsRepository`, `usersRepository`, `ordersRepository`, `reviewsRepository`, `couponsRepository`, `storiesRepository`, and `bannersRepository`.
- Products: `getById`, `getBySlug`, `search` (ranked text across product title/tags/category/merchant, category, collection, merchant, price, colour, size, fabric, fit, occasion, rating, discount, in-stock, relevance/new/price/rating/discount sort, pagination), `facets` (category, collection, merchant, colour, size, fabric, fit, occasion, price ranges).
- Categories: `list`, `getById`, `getBySlug`, `getChildren`. Collections: `list`, `getById`, `getBySlug`, `getProducts`.
- Merchants: `getById`, `getBySlug`, `list` (status, city, text, pagination). Users: `getById`, `getByEmail`, `list`.
- Orders: `getById`, `getByNumber`, `list` (user, status, pagination). Reviews: `getById`, `list` (product, user, rating, verified, pagination), `summary`.
- Coupons: `getByCode`, `listActive`. Stories: `getById`, `getBySlug`, `list`. Banners: `getById`, `list` (optional placement).
- The mock repositories are selected when `DATA_SOURCE=mock` (the default). Other values fail explicitly until their adapter is implemented.
- `src/lib/auth/demo-session.ts` provides `getSession`, `setDemoSession`, `clearDemoSession`, and `requireRole`. This uses an unsigned httpOnly cookie and is DEMO ONLY, not production authentication.
- `proxy.ts` uses the demo session to gate customer, merchant, and admin route groups. Zustand stores are `useCartStore`, `useWishlistStore`, and `useUIStore`.

## P8 demo customer accounts
- `/api/auth/register`, `/login`, `/forgot-password`, `/reset-password`, `/logout`, and `/session` provide local demo flows. `/api/account` reads or updates profile, preferences, and notification settings; `/api/account/addresses` supports address list/create/update/delete; `/api/account/orders/[id]/request` accepts cancellation, return, or exchange requests.
- `src/lib/demo-account-store.ts` is process-memory only and DEMO ONLY. Seed accounts use `Demo123!`; the fixed mock OTP is `123456`; reset links are exposed in the demo UI instead of being sent. No passwords, OTPs, or reset tokens are production-secure or persisted.
- Cancellation, return, and exchange requests are recorded as pending review in the process-memory-only `src/lib/demo-order-requests.ts`; they do not immediately change the order status. The order detail page shows request history.
- New customers can complete or skip the 3-step onboarding. Saved gender/style/size/category preferences personalize the homepage “For you” rail. Checkout pre-fills the customer's default saved address.
- Account routes are `/account`, `/account/profile`, `/account/addresses`, `/account/orders`, `/account/orders/[id]`, `/account/invoice/[id]`, `/account/wishlist`, `/account/reviews`, `/account/notifications`, and `/account/preferences`. The account navigation uses a bottom sheet on mobile.

## Homepage editorial data
- `src/data/stories.ts` exports editable `brandStoryChapters` with original copy about cloth, makers, selvedge-finished edges, and lasting quality.
- `src/data/homepage.ts` exports homepage promises, newsletter copy, testimonials, press names, craft steps, and local Instagram-style placeholder tiles.
- The homepage composes seeded banners, categories, collections, active products, approved merchants, and journal stories. Only the first editorial hero image is marked priority; all media uses local placeholder ids.

## Listing and product-card conventions
- Listing filter state is URL query state: `category`, repeated/comma-separated `size`, `color`, `fabric`, `fit`, `occasion`, optional `merchant`, `rating`, `discount`, `stock=1`, `min`, `max`, `sort`, and `pageSize`; price bounds in URLs are rupees, repository bounds are paise.
- Public merchant storefronts use `/merchant/[slug]/store`; `proxy.ts` explicitly leaves that public path accessible while keeping merchant management routes protected.
- Product cards expose image hover/swipe, save, colour selection, in-stock size quick-add, price/rating, and explicit skeleton state for shared reuse.
- Product detail pages use `/product/[slug]`, resolve products through repositories, and statically generate params from active catalogue fixtures. Keep existing product links on this canonical route; `/p/[slug]` is a compatibility redirect.
- Product gallery and purchase/review interactions are client components; product content, metadata, seller, active offers, review eligibility, recommendations and JSON-LD are loaded server-side.
- `useRecentlyViewedStore` persists up to eight most-recent product IDs in local storage. Demo review fixtures may include `imageIds` and `helpfulCount`; the review form is shown only to customer demo sessions with a delivered order and is explicitly not persisted.
- Cart and wishlist use persistent browser stores. Checkout validates address, delivery, payment and line quantities with `src/lib/checkout-schema.ts`; `POST /api/orders` rechecks current prices/stock, simulates payment, and creates a mock order with per-merchant fulfilment splits. The mock order store is shared on `globalThis` so route handlers and confirmation pages see the same records; it is process-memory only (demo behavior). Payment data is not persisted.

## P9 seller workspace
- `/sell` is the public seller proposition; `/merchant/register` is a five-step RHF + Zod application. A valid application creates a pending merchant account/session and routes to `/merchant/pending`. There is no admin approval UI in P9; seeded approved sellers are the way to exercise the workspace.
- Seeded seller demo: `kavita@shardag.example.test` / `Demo123!` (Sharda Garments). `/api/auth/login` sends merchants to `/merchant/dashboard`. `/merchant` redirects there; the shell guard sends unapproved sellers to `/merchant/pending` and signed-out visitors to `/login` with a `next` path.
- Workspace routes: dashboard, products list/new/edit, orders, payouts, storefront profile and notifications. Product editing supports simulated image uploads with reorder/cover preview, a colour × size variant matrix (SKU/stock/per-variant price), fabric/fit/care, story, SEO, draft/publish and a live inert `ProductCard` preview.
- Order fulfilment states are `accepted`, `packed`, `shipped`, `delivered`, `return_requested` and `returned`. Shipping requires a courier and AWB. The same transitions append merchant notifications.
- Commission comes from `COMMERCE.defaultCommissionRate`. Returned and cancelled lines are excluded from sales, commission and payout estimates but remain visible in the statement with a dash. CSV export is `/api/merchant/payouts?format=csv`.
- Merchant state is process-memory only in `src/lib/demo-merchant-store.ts`; schemas are in `src/lib/merchant-schemas.ts`; guards are in `src/lib/merchant-access.ts`. Brand marks and seller-application logos upload to Cloudinary; supporting documents are still name-only previews. Replace this store with MongoDB and persist documents in P13.

## P10 admin studio
- `/admin` is gated by `getAdminIdentity()` in `src/lib/admin-access.ts`: the demo session must be an `admin` and the account must still have the admin role. Otherwise the layout redirects to `/login?next=%2Fadmin`. Seeded admin: `admin@example.test` / `Demo123!`.
- Routes: dashboard, merchants list/detail, commissions, moderation, products list/new/edit, catalog, content, orders, payouts, coupons, reviews, users and settings. The shell groups these as Marketplace, Commerce and Platform and uses a responsive `DataTable` (desktop table, mobile cards).
- Merchants: application detail, document verification, approve/reject with a reason, suspend/reactivate and per-merchant commission override. Status changes flow to the seller workspace guard and public catalogue. Commissions shows the global default plus overrides.
- Catalogue and content: category/collection CRUD; banner, journal story and featured-collection controls; announcement bar; coupons with pause/scope/delete; review hide/restore/flag decisions. Product editing reuses `MerchantProductEditor` with `mode="admin"` for Sharda Garments listings.
- Orders and payouts are read-only views over the shared mock order store; payouts are estimated from paid lines minus cancelled/returned lines. Users is a read-only account list with spend derived from orders. Settings covers commission, GST slabs, free-delivery threshold, shipping fee, return window and delivery days.
- State lives in `src/lib/admin-store.ts` on `globalThis` (process memory, DEMO ONLY). Public repositories read the same admin categories, collections, banners, stories and coupons; checkout, cart, shipping and returns read admin settings. Changes reset on server restart.
- Zod contracts are in `src/lib/admin-schemas.ts`; APIs are under `/api/admin/{merchants,catalog,content,coupons,products,reviews,settings}`. Client managers call an API and then `router.refresh()` so server components re-read the store.

## P11 information pages, SEO and QA
- Information pages use `src/components/content/info-page.tsx`: breadcrumbs, intro, a sticky “On this page” table of contents and section anchors. Routes: `/about`, `/contact`, `/shipping`, `/returns`, `/privacy`, `/terms`, `/size-guide`, `/faq` and `/track`. The journal has its own list/detail routes at `/stories` and `/stories/[slug]`, both server-rendered from the admin story store with Article and BreadcrumbList JSON-LD.
- `/contact` posts to `/api/contact`; `/track` posts order number plus checkout email to `/api/track-order`. Both are DEMO ONLY: messages are acknowledged and discarded, and tracking reveals limited status only for an in-process order with a matching email.
- SEO helpers live in `src/lib/seo.ts`: `SITE_URL`, `absoluteUrl`, `pageMetadata`, `privateMetadata` and `breadcrumbJsonLd`. Every route declares metadata; account, admin and merchant workspace layouts are noindex. The root title template is `%s | SELVARQ`, so page titles must not repeat the brand.
- `src/app/sitemap.ts` lists the public crawl surface (home, shop, categories, collections, products, storefronts, journal, sell and information pages) and excludes private/admin/auth/checkout routes. `src/app/robots.ts` points at the sitemap and disallows private paths.
- JSON-LD is emitted by the server-only `JsonLd` component, which escapes `<`. Home: Organization, WebSite with SearchAction and a featured ItemList. Listings, product and information pages: BreadcrumbList. Product: Product with offers and ratings. FAQ: FAQPage.
- Share images use `public/brand/og-default.png` (1200×630) with `src/app/icon.png` and `src/app/apple-icon.png`. Product pages use the first raster image, including a Cloudinary public id when configured, and otherwise fall back to the brand card because seeded product art is SVG.
- Accessibility conventions: one `h1` and one `main` per page; all images have alt text; dot-style carousel controls use 24×24 hit areas; UI text is at least 11px; carousel rails are focusable regions with visible focus; native `<dialog>` provides focus trapping, Escape and focus return; JS smooth scrolling respects `prefers-reduced-motion` via `src/lib/motion.ts`.
- Rendering: the root `loading.tsx` moved to `src/app/(home)/loading.tsx`, so prerendered information pages are complete HTML without a Suspense boundary. `/shipping` and `/returns` render per request because they read live admin settings.

## P13 Cloudinary uploads and environment
- `.env.local` is git-ignored and holds the real values: `NEXT_PUBLIC_SITE_URL`, `DATA_SOURCE=mongo`, `NEXT_PUBLIC_DATA_SOURCE=mongo`, `MONGODB_URI` (Atlas cluster `selvarq.stzebev.mongodb.net`, database `selvarq`), `MONGODB_DB=selvarq`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=o0pjmqsx`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`. `.env.example` documents the same keys without secrets.
- `src/lib/cloudinary.ts` configures the SDK server-side and uploads buffers with `upload_stream`; folders are `selvarq/{products,categories,collections,banners,stories,merchants,seller-applications}` (`src/lib/upload-folders.ts`).
- `POST /api/uploads` is the only upload entry point. Admin and approved-merchant sessions can upload; guests may upload only to `seller-applications`. Images are JPG/PNG/WebP/AVIF/GIF, max 8 MB (4 MB guest), rate-limited in process. A missing Cloudinary config returns 503 with a clear message.
- Client helpers: `src/lib/upload-client.ts` (validate + POST) and `src/components/ui/image-uploader.tsx` (`ImageUploader` preview/replace/remove, `ImageUploadButton` for parent-owned grids). Product editor, admin category/collection/banner/story forms, merchant profile and seller registration all use them.
- `src/lib/media.ts` resolves bare public ids to `res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto/<id>` and exposes `resolveShareImage` for OG/JSON-LD. `placeholder:` ids remain the seeded fallback.
- `Category.imageId` is optional and feeds the homepage category tiles. Uploaded assets are not deleted from Cloudinary when a reference is removed; prune orphans separately.

## P13 MongoDB persistence
- `src/lib/db/` is the persistence layer: `types.ts` (domains, records), `connection.ts` (cached mongoose connection, `isMongoEnabled`), `entities.ts` (`loadDomain`/`saveDomain`/`markDomainSeeded`), `persistence.ts` (`markDirty` write-behind queue, `flushPersistence`) and `hydrate.ts` (boot hydration).
- Storage is one `entities` collection with `{ domain, kind, entityId, position, data }` and a unique index on `(domain, kind, entityId)`. Domains: `admin`, `merchant`, `accounts`, `orders`, `orderRequests`. `kind` is the logical list inside a domain (`products`, `categories`, `settings`, `orders`, ...).
- Repositories keep reading the in-memory stores. Each mutating store function calls `markDirty(domain, serializer)`; writes are coalesced per tick and `saveDomain` upserts current records then deletes stale ones, skipping the `__meta` marker. `DATA_SOURCE=mock` skips all of this.
- `src/instrumentation.ts` calls `hydrateFromDb()` once per Node process, skipping `phase-production-build`. An empty domain is filled from the demo fixtures only when demo content is enabled; otherwise it is marked seeded and left empty. A marked domain replaces memory with its stored records, so edits and deletions survive restarts.
- Write-behind errors are logged, not thrown. Abrupt shutdown can lose the last queued write; reads never hit MongoDB after hydration, so a second process needs a restart to see another process's writes.
- Demo content is disabled by default in Mongo mode (`SEED_DEMO_DATA=true` overrides it). `src/lib/db/production-seed.ts` then creates only the `SEED_ADMIN_*` and `SEED_SELLER_*` accounts plus the seller's approved merchant records; the admin store, accounts, orders and merchant catalogue start empty, so no demo data is written to the database.
- Env keys for the access accounts: `SEED_ADMIN_NAME`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_SELLER_NAME`, `SEED_SELLER_EMAIL`, `SEED_SELLER_PASSWORD`, `SEED_SELLER_BUSINESS_NAME`, `SEED_SELLER_MERCHANT_ID`, `SEED_SELLER_CITY`. Existing accounts keep their current password; only missing records are created. Admins land on `/admin` after login. In mock mode the same accounts are created in memory on every boot, so the production credentials also work in local development; mock mode never writes to MongoDB.
- Live setup: `.env.local` points at the Atlas cluster `selvarq.stzebev.mongodb.net` (database `selvarq`) with `DATA_SOURCE=mongo` and `NEXT_PUBLIC_DATA_SOURCE=mongo`, so local development and production share one dataset. The first boot created only the admin, the seller, the seller's merchant/application records, admin settings and the announcement; there are no demo products, categories, collections, coupons, stories, reviews, customers or orders. Production must set the same four keys plus the `SEED_*` values; `NEXT_PUBLIC_DATA_SOURCE` is inlined at build time, so rebuild after changing it.

## P13 storefront de-mock
- `demoDataEnabled()` (`src/lib/demo-data.ts`) decides whether the bundled demo catalogue exists. It is on for `DATA_SOURCE=mock`, off for `mongo`, and `SEED_DEMO_DATA=true|false` overrides both. `NEXT_PUBLIC_DATA_SOURCE` mirrors `DATA_SOURCE` because client bundles cannot read server-only env vars; keep the two in sync.
- `src/data/index.ts` exports empty arrays for every catalogue collection (products, categories, collections, merchants, users, coupons, stories, banners, reviews, orders) when demo content is off. Editorial copy — FAQs, brand story, craft steps, newsletter, testimonials, promises — always stays.
- Public surfaces read live repositories/admin state instead of importing seeds: header nav, mobile menu, search overlay, mini-cart, shop/category/collection/search listings, product pages, sitemap, homepage rails and `/api/orders`.
- The cart, checkout and merchant order list render entirely from the line data captured at add-to-bag/checkout time (name, image, price, merchant, stock), so an empty catalogue does not break them. `CartItem` carries optional `slug`, `merchantName` and `stock`.
- Account wishlist, account reviews, order detail, preferences, onboarding, the admin review queue and the merchant product/profile screens read from repositories instead of seed arrays.
- Empty states: no banners shows a brand-led hero; category tiles, collections, product tabs and the makers section hide themselves until data exists.
- Verified in a production-like run (`DATA_SOURCE=mock`, `NEXT_PUBLIC_DATA_SOURCE=mongo`): homepage, `/shop`, `/search`, `/cart`, `/wishlist` and category/collection routes contain no demo products or merchants; only the real `NWX Global Services` seller appears; both production logins still return `/admin` and `/merchant/dashboard`. `npm run typecheck`, `npm run lint` and `npm run build` pass.

## P13 admin password change
- `/admin/settings` renders `AdminPasswordForm` (`src/components/admin/password-form.tsx`) below the commerce settings. It posts current, new and confirm passwords to `POST /api/admin/password`, which is gated by `getAdminIdentity()`, validates with `changePasswordSchema` (`src/lib/account-schemas.ts`) and calls `changeDemoPassword` in `src/lib/demo-account-store.ts`.
- `changeDemoPassword(id, currentPassword, newPassword)` returns false when the account is missing or the current password is wrong (401). Mismatched confirmation and reusing the current password fail validation (400). The new password is persisted through the same account write-behind path as other account changes.
- Auth redirects: `/api/auth/login` returns `{ next, role }`. `login-form.tsx` only follows `?next=` when the role can open that path, otherwise it uses the role home (`/admin` for admins, `/merchant/dashboard` for sellers). Demo credential hints were removed from the login screen.

## P13 seeded catalogue and content
- The Atlas database now contains real, admin-editable store content in addition to the access accounts: 4 categories (Sarees, Kurta Sets, Dresses, Festive Edit), 3 collections (The Wedding Edit, Everyday Linen, Festive Zari), 9 products, 3 hero banners, 3 journal stories and the announcement bar. Nothing was written by the boot seeder; records went through the admin APIs so they persist in the same `admin` domain as later admin edits.
- Images are Cloudinary assets under `selvarq/{categories,collections,banners,stories,products}/<key>` with deterministic public ids. `MediaImage` resolves them to `res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto/...`; there are no `placeholder:` ids in the seeded catalogue.
- `GET /api/admin/catalog` returns categories + collections and `GET /api/admin/content` returns banners + stories + announcement, so seed/automation can upsert by slug/name.
- Admin product writes resolve a merchant that exists and is approved (`PLATFORM_SELLER.id` first, then any approved merchant) because the product page 404s without one; in this database that is `nwx-global-services`. `adminProductSchema` accepts optional `collectionIds` and `adminCollectionSchema` accepts optional `productIds`; `saveAdminProduct`/`saveAdminCollection` store them. Collection listing pages filter on `product.collectionIds`, so both sides are kept in sync.
- Verified after a restart: `[db] Hydrated 5 domain(s) from MongoDB.` and all seeded records re-appear in the admin APIs, admin pages and storefront. `npm run typecheck`, `npm run lint` and `npm run build` pass.

## P13 pasted image URL import
- `POST /api/uploads` accepts JSON `{ url, folder }` in addition to multipart files. The server validates and downloads the link, then uploads the bytes to Cloudinary and returns the usual `{ asset }`; the catalogue stores the `selvarq/...` public id, so `next/image` only receives configured hosts.
- Security and limits: http/https only; localhost, `.local`/`.internal`, private, loopback, link-local and IPv4-mapped addresses are rejected after DNS resolution; redirects are followed manually (max 3) with the same check on every hop; 15 s timeout; content-type or magic-byte image check; 8 MB (4 MB guest) limit; existing role/folder checks and rate limits still apply. `runtime = "nodejs"` because the route uses `node:dns/promises`.
- Client helpers: `uploadImageFromUrl(url, folder)` (`src/lib/upload-client.ts`), `ImageUploader`'s "Use URL" field, and `ImageUrlImporter` for parent-owned preview grids. Bare public ids and `/public` paths are still accepted unchanged. The product editor's imagery section has both "Add images" and a paste-link field.
- `MediaImage` uses `unoptimized` for any legacy non-Cloudinary remote URL, so an old record degrades gracefully instead of triggering the admin error boundary.

## React `use()` console warning (dev-only, no app fix)
- React 19 error 607 was not reproducible from app code: no `use()` calls exist in `src`, and fresh admin sessions produced clean consoles across storefront, admin, merchant, logout/login and image URL import flows.
- The conditional `use()` calls are in Next 16.4.6's dev-only Suspense DevTools instrumentation (`node_modules/next/dist/client/components/navigation.js` and `layout-router.js`, guarded by `NODE_ENV !== 'production'`). A hot reload or deferred RSC transition can make a component suspend through `use()` on one render and skip it on the retry, which logs this warning.
- Do not change app code for this warning unless it appears in a production build or a console message includes a source-mapped stack pointing at `src`. Capture the exact route/action and console source URL/line in that case.

## P13 product validation messages
- `merchantProductSchema` keeps the 3–6 image rule but attaches readable messages to array and number checks, so the UI never shows raw Zod text such as `Too small: expected array to have >=3 items`.
- `MerchantProductEditor` maps the first validation issues to field labels (for example `Images: Add at least 3 product images.`), and the imagery section/publish sidebar show the current image count against the 3-image minimum. Publishing still requires at least 3 images; failed validation does not write to MongoDB.
