# SELVARQ: progress

## Phase checklist
- [x] P0 Foundation: scaffold, tokens, fonts, types, config, format, UI primitives, /styleguide (written; NOT yet installed or built, see Known issues)
- [x] P1 Data layer: mock data (src/data), seeded catalogue
- [x] P2 Data layer: repository API/mock adapters, DATA_SOURCE selection, demo session guards, client stores
- [x] P3 Global shell: responsive navigation, overlays, footer, consent, toast provider and route states
- [x] P4 Homepage: editorial story, category and collection discovery, product tabs, makers, journal, community, metadata
- [x] P5 Catalog: reusable product card, URL-synced filters and listing/storefront routes
- [x] P6 Product detail: gallery, purchase options, reviews and recommendations
- [x] P7 Cart, wishlist and checkout: merchant grouping, validated mock payments and confirmation
- [x] P8: customer auth, onboarding and account area
- [x] P9: seller landing, merchant registration, seller workspace, catalogue, fulfilment and payouts
- [x] P10: admin studio, merchant moderation, catalogue/content management and platform operations
- [x] P11: static information pages, SEO and structured data, accessibility, performance and responsive QA
- [ ] P12: deliverable packaging (scope set by the user per phase)
- [~] P13: Cloudinary uploads live; MongoDB persistence enabled against Atlas; production admin/seller seeding, admin password change and seeded catalogue/content verified; signed auth still pending (see P13 sections)
- [ ] P12 deliverable: selvarq.zip (no node_modules, no .next) + README

## P0: files created
Config: package.json, tsconfig.json, next.config.ts (remote images; auto-detects public/brand logo PNGs), postcss.config.mjs, eslint.config.mjs, .gitignore, .env.example
App: src/app/{layout,page,loading,error,not-found}.tsx, globals.css; src/app/styleguide/{page,loading}.tsx and _sections/{section,tokens,buttons,forms,form-demo,feedback,overlays,navigation,commerce}.tsx
Lib: src/lib/{config,format,utils,env,media,fonts}.ts, src/data/copy.ts
Types: src/types/{common,user,merchant,catalog,review,order,marketing,index}.ts
State/hooks/styles: src/store/toast-store.ts, src/hooks/use-modal-dialog.ts, src/styles/overlays.css
UI: src/components/ui/{button,field,input,textarea,select,checkbox,radio,badge,rating,rating-input,skeleton,sheet,dialog,tabs,accordion,toast,breadcrumbs,price,quantity-stepper,logo,placeholder-art,media-image}.tsx

## Known issues
1. P0 scaffold/build remains unverified: `create-next-app`, `npm install` and `npm run build` were not run during P0. The current workspace has local TypeScript and ESLint executables; the P2 repository/auth/store files pass `tsc --noEmit` and targeted ESLint. Run a full build when practical.
2. package.json uses caret ranges I could not resolve (lucide-react ^0.468, etc.) and there is no lockfile. next and eslint-config-next are pinned to 16.4.6; confirm that version resolves, otherwise use latest 16.x and record it here.
3. Untested Tailwind v4 specifics: `@utility` with nested `@media`, `peer-aria-[invalid=true]`, `peer-checked:[&>svg]`, `@theme static` fonts. Check on first build.
4. Gold focus ring (#B8923A on ivory) is roughly 2.9:1, just under the 3:1 non-text guideline. Options: add an indigo inner ring, or accept. Contrast figures are hand estimates; verify with a tool.
5. Resolved in P11: `--muted` is now `#5f5f75` (5.38:1 on pearl, 5.81:1 on ivory) and `--gold-ink` is `#785a16` (5.56:1 on pearl), so small muted and gold-ink text pass AA. Re-check if the palette changes.
6. Toasts render below an open Dialog or Sheet (top layer). Fix with the popover API if toasts must show over overlays.
7. Sheet and Dialog use native <dialog> with @starting-style transitions: needs Chrome 117+, Safari 17.5+, Firefox 129+ for animation; older browsers still work, without motion. Children stay mounted while closed.
8. Placeholders to confirm with the user: standard shipping fee (Rs 99), delivery window (3 to 7 days). GST slab bound is inclusive at Rs 2,500; the CA must confirm slabs and how the threshold is applied.
9. `<Logo />` image mode is decided when `next dev`/`next build` starts (reads public/brand). Restart dev after adding the PNGs. Only PNG is detected.
10. With Cloudinary enabled, delivery URLs carry f_auto,q_auto and next/image optimises the same asset again. That double optimisation is intentional for now: Cloudinary picks the format, Next trims it to the rendered width.
11. Product-detail review submissions remain demo-only and are not persisted; the UI states this explicitly.
12. Cart, wishlist, and mock orders persist only in browser storage or the running server process. They reset when local storage is cleared or the server restarts; P13 will replace mock persistence.
13. P8 authentication is DEMO ONLY: passwords, accounts, profile data, addresses, notification choices, and reset tokens are held in process memory; the unsigned httpOnly cookie and fixed mock OTP are not production authentication. Replace with persistent storage, password hashing, expiring signed sessions and a real OTP provider in P13.
14. P9 merchant data is DEMO ONLY: applications, listings, fulfilment state, storefront profiles, notifications and payout statements live in the server process and reset on restart. Merchant brand marks and seller-application logos now upload to Cloudinary; supporting documents are still stored as file names only.
15. P9 has no admin review screen. Newly registered merchants stay `pending` and see `/merchant/pending`; the seeded approved seller (`kavita@shardag.example.test` / `Demo123!`, Sharda Garments) demonstrates the workspace. CSV exports and payout figures are illustrative, not settlement instructions.
16. P9 commission is read from `COMMERCE.defaultCommissionRate` (12%) rather than hardcoded. Returned and cancelled lines are excluded from net sales, commission and payout totals, but remain visible in the statement with a dash.
17. P10 admin data is DEMO ONLY: merchants, products, catalogue, content, coupons, review decisions and settings live in `src/lib/admin-store.ts` in process memory. They propagate to the seller workspace and public repositories in the running process, then reset on restart. Admin writes are not audited and there is no granular admin role; authentication reuses the demo session cookie.
18. P11 contact messages are validated and acknowledged but discarded, never sent or stored. Order tracking only matches orders in the running process and requires the exact checkout email; it reveals limited status, not a courier feed.
19. `NEXT_PUBLIC_SITE_URL` must be set before `next build` for canonical URLs, Open Graph URLs and `sitemap.xml`. It defaults to `http://localhost:3000`, so a build served on another port still advertises port 3000.
20. Open Graph images: the default is `public/brand/og-default.png` (1200×630). Product share images use the first raster image, including a Cloudinary public id when a cloud name is set; seeded SVG placeholder art still falls back to the default.
21. `/shipping` and `/returns` render per request because their copy reads live admin settings. The remaining information pages are prerendered at build time; admin setting edits appear there only after a rebuild. `/stories` and `/stories/[slug]` are also per-request so admin journal edits appear immediately.
22. During a route-level Suspense swap, the loading skeleton's `<main aria-busy>` can coexist with the page `<main>` for a frame. The settled DOM has exactly one `main`; prerendered information pages have no loading boundary at all.
23. Cloudinary uploads need `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` as well as the API key and secret. With the cloud name blank, `/api/uploads` returns 503 and every surface keeps its placeholder fallback. Add the cloud name to `.env.local` and restart.
24. MongoDB is now live against the Atlas cluster `selvarq.stzebev.mongodb.net` (database `selvarq`) with `DATA_SOURCE=mongo` and `NEXT_PUBLIC_DATA_SOURCE=mongo`, so local development and production read and write the same database. The first boot seeded only the `SEED_*` admin and seller accounts, the seller's approved merchant/application records, admin settings and the announcement; there are no demo products, categories, collections, coupons, stories, reviews, customers or orders. Persistence is write-behind: repositories read the in-memory set, which is hydrated once per process, so another running instance does not see new writes until it restarts. Production deployments must set the same four keys (`MONGODB_URI`, `MONGODB_DB`, `DATA_SOURCE`, `NEXT_PUBLIC_DATA_SOURCE`) plus the `SEED_*` values; `NEXT_PUBLIC_DATA_SOURCE` is baked in at build time.
25. Removing an image from a record does not delete the asset from Cloudinary; it only removes the reference. Orphaned assets must be pruned in the Cloudinary console or by a later cleanup job.
26. Seller-application supporting documents are still name-only previews. Only the brand logo uploads to Cloudinary (`selvarq/seller-applications`). Guest uploads are limited to that folder, images only, 4 MB, and a small in-process rate limit.
27. Sign-in honours a `next` query param only when the authenticated role can open that path. Without this, an admin arriving at `/login?next=/account` was sent to `/account`, bounced by middleware back to `/login`, and never reached `/admin`. The API now returns `role` alongside `next`, and the form falls back to the role home for a mismatched target. If a page sticks on its `loading.tsx` skeleton, the dev cache is stale after a `next build`; delete `.next` and restart `next dev`.

## Next phase
P13: replace the demo session with signed, expiring auth (jose) and hashed passwords (bcryptjs). Then P12 deliverable packaging.

## P13 Cloudinary and environment update
- Added `.env.local` (git-ignored) with `NEXT_PUBLIC_SITE_URL`, `DATA_SOURCE=mock`, an empty `MONGODB_URI`, the Cloudinary cloud name `o0pjmqsx`, API key and secret.
- Installed `cloudinary@2.11.0`. `src/lib/cloudinary.ts` uploads image buffers server-side with the API secret; the browser only talks to `/api/uploads`.
- `/api/uploads` accepts multipart images from admins, approved merchants and seller applicants (guests may only write to `selvarq/seller-applications`). Limits: JPG/PNG/WebP/AVIF/GIF, 8 MB (4 MB for guests), 8 uploads/minute for guests and 60/minute otherwise.
- `src/lib/media.ts` resolves bare Cloudinary public ids to `res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto/...`, supports the optional `cloudinary:` prefix, and exposes `resolveShareImage` for OG/JSON-LD.
- Added `ImageUploader`, `ImageUploadButton` and `ImageUrlImporter` (drag-free previews, replace/remove, pasted links imported to Cloudinary, or an existing public id) and wired them into:
  - product editor (multi-image, 6 max, first image is the cover)
  - admin categories (new optional `Category.imageId`, used by the homepage category tiles)
  - admin collections, hero/campaign banners and journal stories
  - merchant storefront brand mark and the seller-application logo
- Product metadata and Product JSON-LD now use Cloudinary URLs when present; seeded `placeholder:` art still falls back to the generated SVG and the default OG card.
- Validation: `npm run typecheck`, `npm run lint` and `npm run build` pass with no errors (117 pages).

## P13 MongoDB persistence
- Installed `mongoose@9`. `src/lib/env.ts` validates `DATA_SOURCE=mock|mongo`, `MONGODB_URI` (optional) and `MONGODB_DB` (default `selvarq`).
- `src/lib/db/connection.ts` caches one mongoose connection per process; `DATA_SOURCE=mongo` without `MONGODB_URI` fails with a clear message instead of silently falling back.
- Storage shape: one `entities` collection keyed by `(domain, kind, entityId)` with `position` and a free-form `data` document. Domains are `admin`, `merchant`, `accounts`, `orders` and `orderRequests`; each maps to the existing in-memory store through a serializer (`adminDocuments`, `merchantDocuments`, `accountDocuments`, `orderDocuments`, `orderRequestDocuments`) and an `apply*` function.
- `src/lib/db/hydrate.ts` runs once per process from `src/instrumentation.ts` (Node runtime, skipped during `phase-production-build`). A domain with no records is seeded from the current demo data and marked with a `__meta` record; a domain with records replaces the in-memory state. The marker means deletions survive a restart and an emptied domain is not reseeded.
- `src/lib/db/persistence.ts` implements write-behind persistence: each mutating store function calls `markDirty(domain, serializer)`, same-tick calls are coalesced, and `saveDomain` upserts the current records and deletes stale ones (never the `__meta` marker). Errors are logged, not thrown, so a database hiccup does not break a request.
- Repositories continue to read from the in-memory working set, so no page or route handler changed. `src/lib/repo/index.ts` accepts both `mock` and `mongo`.
- Verified end-to-end against a temporary in-memory MongoDB: hydration seeded all five domains, then an admin category create, merchant profile update, customer notification preference, checkout order and cancel request all persisted and survived a server restart (confirmed in the database and in rendered HTML/API responses). The temporary test harness was removed; `npm run typecheck`, `npm run lint` and `npm run build` pass.
- Not done: signed auth (jose/bcryptjs), real Atlas verification, orphaned Cloudinary cleanup, and multi-instance cache invalidation.

## P13 production access accounts
- Demo content is now opt-in for MongoDB: `demoDataEnabled()` (`src/lib/demo-data.ts`) is on for `DATA_SOURCE=mock` and off for `mongo`. `SEED_DEMO_DATA=true|false` overrides it. `NEXT_PUBLIC_DATA_SOURCE` mirrors `DATA_SOURCE` for client bundles; keep the two in sync so server-rendered and client-rendered surfaces agree. With demo content off, the admin store, account store, order store and merchant catalogue start empty, so no seeded catalogue can be written back to the production database.
- `src/lib/db/production-seed.ts` creates the production accounts from `SEED_*` environment variables on boot: `SEED_ADMIN_NAME|EMAIL|PASSWORD` (role admin) and `SEED_SELLER_NAME|EMAIL|PASSWORD|BUSINESS_NAME|MERCHANT_ID|CITY` (approved merchant). Existing accounts keep their current password; only missing records are created.
- The seller account gets an approved merchant application (seller workspace) and an approved admin merchant record (admin studio list), both with `placeholder:` art until a logo is uploaded.
- `src/instrumentation.ts` runs the production seed on every boot in mock mode (so the `SEED_*` admin and seller logins work in local development alongside the demo data), and after MongoDB hydration in mongo mode (where it only runs when demo content is disabled).
- `POST /api/auth/login` now sends admins to `/admin`.
- Verified against the live Atlas database (`selvarq.stzebev.mongodb.net`, database `selvarq`) with demo content off: it contains only the two access accounts, the seller merchant/application records, admin settings/announcement and `__meta` markers — no products, categories, collections, coupons, stories, reviews, orders or demo customers. Both logins, `/admin` and `/merchant/dashboard` return 200, the storefront shows no demo products, and a restart re-hydrates without duplicating accounts.
- `.env.local` holds the real admin (`admin@nwxglobalservices.com`) and seller (`seller@nwxglobalservices.com`) credentials, the seller merchant id `nwx-global-services`, and the Atlas `MONGODB_URI` with `DATA_SOURCE=mongo` / `NEXT_PUBLIC_DATA_SOURCE=mongo`. Local development therefore uses the same data as production. `.env.example` documents the keys without values.

## P13 storefront de-mock
- `src/data/index.ts` now exports empty catalogue arrays (products, categories, collections, merchants, users, coupons, stories, banners, reviews, orders) when demo content is disabled. Editorial copy (FAQs, brand story, craft steps, newsletter and testimonial sections) always stays.
- Every public surface reads live data instead of the bundled seeds: header nav, mobile menu, search overlay, mini-cart, shop/category/collection/search listings, product pages, sitemap, homepage sections and the order API.
- The cart, checkout and merchant order list render entirely from the line items already stored in the cart/order (name, image, price, merchant, stock), so they work with an empty catalogue. `CartItem` now also carries `slug`, `merchantName` and `stock` at add-to-bag time.
- Account wishlist, account reviews, order detail, preferences and onboarding, plus the admin review queue and merchant product/profile screens, read from the admin/merchant repositories rather than seed arrays.
- Empty-state handling: with no banners the homepage shows a brand-led hero; category, collection, product-tab and makers sections hide themselves until data exists.
- Verified in a production-like run (`DATA_SOURCE=mock`, `NEXT_PUBLIC_DATA_SOURCE=mongo`, so no demo data): the homepage, `/shop`, `/search`, `/cart`, `/wishlist` and category/collection routes contain no demo products or merchants, the only maker shown is the real `NWX Global Services` seller, and both production logins still return `/admin` and `/merchant/dashboard`. `npm run typecheck`, `npm run lint` and `npm run build` pass.

## P13 admin password change
- Signed-in admins can change their own password from `/admin/settings`. `AdminPasswordForm` (`src/components/admin/password-form.tsx`) collects current, new and confirm fields; `POST /api/admin/password` is admin-gated, validates with `changePasswordSchema` (`src/lib/account-schemas.ts`), and calls `changeDemoPassword(id, currentPassword, newPassword)` in `src/lib/demo-account-store.ts`, which verifies the current password before writing and persisting.
- Validation covers a wrong current password (401), mismatched confirmation (400) and reusing the current password (400). Verified end to end: change to a temporary password then back to the seeded one; both writes persisted and survived a restart.
- Login redirects now honour `?next=` only when the signed-in role can open that path: `/api/auth/login` returns `{ next, role }`, and `login-form.tsx` falls back to the role home (`/admin` or `/merchant/dashboard`). Stale demo credentials were removed from the login screen.

## P13 seeded catalogue and content
- Seeded the production Atlas database with curated SELVARQ data through the admin APIs, so every record is real store data and editable in the admin studio: 4 categories (Sarees, Kurta Sets, Dresses, Festive Edit), 3 collections (The Wedding Edit, Everyday Linen, Festive Zari), 9 products with variants, 3 hero banners, 3 journal stories and the announcement bar.
- Images are real assets, not placeholders: 40 photographs were downloaded from Unsplash, uploaded to Cloudinary with deterministic public ids (`selvarq/{categories,collections,banners,stories,products}/<key>`) and referenced from the records. Homepage hero/category/journal, listing cards, collection pages and product galleries all resolve through `MediaImage` to `res.cloudinary.com/o0pjmqsx`.
- Admin products need an approved merchant or their product page 404s. `saveAdminProduct` now prefers `PLATFORM_SELLER.id` when that merchant is approved, then any approved merchant, then the platform id; in this database it resolves to `nwx-global-services`. Admin product payloads accept optional `collectionIds`, and collection payloads accept optional `productIds`, so seeded collections actually contain products (listing pages filter by `product.collectionIds`).
- Added read endpoints `GET /api/admin/catalog` (categories + collections) and `GET /api/admin/content` (banners + stories + announcement) so seeds and tooling can upsert by slug/name instead of duplicating records.
- Verified after a dev-server restart: `[db] Hydrated 5 domain(s) from MongoDB.`, `/api/admin/catalog` returns 4 categories and 3 collections, `/api/admin/products` returns the 9 products, `/api/admin/content` returns 3 banners and 3 stories, and `/admin/products`, `/admin/catalog`, `/admin/content` and `/admin/settings` render the seeded records. Storefront checks: `/` shows the 3 hero banners, 4 category tiles and 3 journal stories with Cloudinary art; `/category/sarees`, `/collection/the-wedding-edit`, `/collection/everyday-linen` and `/product/ivory-handloom-saree-659046` return 200 with the seeded products, price and gallery. `npm run typecheck`, `npm run lint` and `npm run build` pass.

## P13 pasted image URL import
- Pasting an external image link no longer stores the raw URL (which crashed `next/image` with "hostname is not configured"). `POST /api/uploads` now also accepts JSON `{ url, folder }`, downloads the image server-side and uploads it to Cloudinary; the catalogue stores the returned `selvarq/...` public id.
- Import guards: http/https only, localhost/private/link-local hosts blocked (including DNS-resolved addresses), redirects followed manually with the same check on every hop, 15 s timeout, image content-type or magic-byte sniffing, and the existing 8 MB (4 MB guest) size limit. `node:dns/promises` keeps this route on the Node runtime.
- Client: `uploadImageFromUrl(url, folder)` in `src/lib/upload-client.ts`; `ImageUploader`'s "Use URL" field and the new `ImageUrlImporter` show a busy state, toast failures and keep accepting bare public ids/paths. The product editor's imagery section now has a paste-link field alongside "Add images".
- `MediaImage` renders any legacy non-Cloudinary remote URL with `unoptimized`, so an older record shows instead of taking down the admin error boundary.
- Verified with the reported `https://encrypted-tbn0.gstatic.com/images?q=tbn:...` link: the API returned `selvarq/banners/images_r4rjab` and the product editor showed the imported Cloudinary preview and "Image added" toast. Private (`127.0.0.1`), HTML (`example.com`) and malformed links returned 400/415/400.

## P1 data seed update
- Added typed, domain-split fixtures in `src/data/` and a typed export surface in `src/data/index.ts`.
- Seeded the requested catalogue and commerce examples, including 48 products with variant-level stock and `placeholder:` media IDs.
- Added `/api/placeholder/[id]` to serve locally generated SELVARQ SVG art without hotlinked images.
- Updated `PROJECT_CONTEXT.md` with the mock-data and placeholder-media conventions.
- Seed counts and product image/colour ranges were checked with a local fixture-count script. Dependencies and the project build remain unverified per Known issue 1.

## P2 repository and state update
- Added typed repository interfaces and mock adapters for products, categories, collections, merchants, users, orders, reviews, coupons, stories, and banners under `src/lib/repo/`.
- Product search supports text, category, collection, merchant, price, colour, size, sorting, pagination, and self-excluding facet counts. Only active products from approved merchants are listed.
- `DATA_SOURCE` selects mock repositories by default; unsupported sources throw explicitly until the Mongo adapter is added in P13.
- Added DEMO ONLY unsigned httpOnly-cookie session helpers and role-gating `proxy.ts` for account, merchant, and admin routes.
- Added persisted merchant-grouped cart and wishlist stores plus an ephemeral UI overlay store.
- Unit-style `tsx` checks were not added because `tsx` is not available in the workspace; targeted runtime verification remains pending a test runner.

## P3 global shell update
- Added responsive site shell with a pausable rotating offer bar, centered mobile wordmark, desktop category/collection mega-menu, mobile menu drawer, search suggestions/recent terms, wishlist/account links, and merchant-grouped mini-cart.
- Added mobile bottom navigation, newsletter UI, footer links/trust/payment indicators, cookie choices, scroll-to-top, and retained the existing toast provider.
- Root loading/error/not-found states already existed and remain branded.
- Hardened persisted cart/wishlist storage for server rendering with a no-op server adapter and browser localStorage.
- Made subcategory slugs parent-qualified to keep same-named departments (for example, men's and women's kurtas) routable without collisions.
- Browser-checked desktop mega-menu/search overlay and mobile drawer/bottom tabs. Fixed the cart facet selector render loop and menu click/hover interaction found during browser checks.
- Validation: `tsc --noEmit`, targeted ESLint, and `npm run build` passed with no warnings.

## P4 homepage update
- Replaced the placeholder landing page with an editorial homepage using seeded banners, category roots, collections, products, approved independent merchants, and journal entries.
- Added editable brand-story chapters in `src/data/stories.ts`, plus homepage trust promises, newsletter copy, testimonials, press names, craft steps, and local placeholder social tiles in `src/data/homepage.ts`.
- Added swipeable snap hero with two CTAs, trust strip, shop-by-category tiles, three-chapter story with CSS scroll reveal, curated collection rail, accessible new/bestseller tabs using ProductCard, maker spotlight, craft process, testimonials/press, journal teasers, Instagram-style grid, and newsletter signup.
- Added canonical/Open Graph metadata and JSON-LD Organization, WebSite/SearchAction, and featured-collections ItemList.
- Only the first hero slide is marked priority; all imagery uses local generated placeholders and no hotlinked image sources.
- Browser checked homepage section content, four hero slides, desktop bestsellers tab (8 cards), search/nav shell, and mobile layout. Validation: `tsc --noEmit`, targeted ESLint, and `npm run build` passed.

## P5 catalog update
- Promoted `ProductCard` to `src/components/product/product-card.tsx` for reuse. Added desktop alternate-image hover, mobile swipe/dots, New/Bestseller/discount badges, merchant/fabric/fit details, price and rating chip, colour swatches, wishlist, in-stock size quick-add, mini-cart handoff, and skeleton state.
- Expanded mock product search to weighted relevance across title, tags, category and merchant, with filters for category, size, colour, price, fabric, fit, occasion, rating, discount, merchant and inventory; sorting now supports relevance, new, price, rating and discount.
- Added `/shop`, `/category/[slug]`, `/collection/[slug]`, `/search`, and approved public `/merchant/[slug]/store`, all sharing responsive listing, result counts, active chips, desktop sidebar, mobile filter sheet, empty state and load-more page-size URL state.
- Preserved compatibility by redirecting `/c/[slug]` and `/collections/[slug]`; updated existing shell/home links to the canonical routes. Public storefront path is exempted from the merchant management role gate.
- Added listing loading skeletons and updated route/repository/component conventions in `PROJECT_CONTEXT.md`.
- Browser checked shop listing, category results, relevance search for linen, public Loom & Line storefront, mobile filter URL state, and quick-add to merchant-grouped mini-cart. Validation: `tsc --noEmit`, targeted ESLint, and `npm run build` passed.

## P6 product detail update
- Added `/product/[slug]` with `generateStaticParams` for active catalogue products, SEO metadata, canonical URL, Open Graph image, and Product JSON-LD including INR offer, stock state, seller and aggregate rating. `/p/[slug]` permanently redirects for compatibility.
- Added responsive product gallery with swipe navigation, thumbnail selection, full-screen viewer, and zoom; product information includes category breadcrumbs, seller/storefront link, rating-to-reviews, GST-inclusive price and savings, colour/stock-aware size selection, size-guide dialog, quantity caps, pincode estimate, active coupon copy, and trust promises.
- Added mobile sticky wishlist/add-to-bag bar, product details/fabric-care/shipping-returns/seller accordions, editorial story and product-specific Q&A.
- Added review histogram, rating/verified/photo filters, generated customer photo placeholders and helpful voting. The write-review form is gated to demo customers with a delivered order; it clearly notes that submissions are not persisted.
- Added similar and collection-based recommendations plus an eight-item persisted recently viewed store. Updated cards, search and mini-cart links to `/product/[slug]`.
- Validation: `npm run typecheck`, targeted ESLint, and `npm run build` passed. Production browser checks covered product rendering, size guide and image viewer, size selection/add-to-bag, mobile sticky purchase controls, photo filter, and recently viewed persistence.

## P7 cart, wishlist and checkout update
- Added `/cart` with merchant-grouped items, size edits, quantity controls, move-to-wishlist/remove, coupon validation, GST-inclusive price/tax/delivery breakup, complimentary-delivery progress, and explicit stock/price conflict resolution.
- Added `/wishlist` from the persisted wishlist store with reusable ProductCards.
- Added guest or demo-customer `/checkout` with address, delivery, payment and review steps. Zod schemas validate addresses, quantities, coupon shape and method-specific UPI/card/netbanking fields; mock payment can succeed or decline, while COD remains pending.
- Added validated `POST /api/orders` mock flow. It rechecks current price/stock, returns actionable conflicts without placing an order, checks active coupon eligibility, calculates delivery/GST/discount, simulates success/failure, decrements stock on success, and records an order with merchant-split fulfilment records in a `globalThis`-shared process-memory store.
- Added `/order/[id]/confirmation` with order/merchant summaries, delivery address, payment state, and a restrained reduced-motion-aware success animation. Mock order records are process-memory only.
- Extracted the checkout step panels and shared checkout types into `src/components/commerce/checkout-steps.tsx` to keep the flow controller focused.
- Validation: `npm run typecheck`, targeted ESLint, and `npm run build` passed. API checks confirmed invalid addresses return 400, stale prices return 409, declined payments return 402, and successful checkout creates an order with merchant splits. Browser checks covered address validation, payment decline without clearing the bag, successful purchase and redirect, cart-to-wishlist movement, and confirmation rendering.

## P8 customer auth and account update
- Added customer registration with name, email, mobile, password-strength meter and consent; login by email/mobile and password or fixed demo OTP (`123456`); disabled social-login placeholders; forgot/reset password with a single-use in-memory demo reset link; and logout.
- Added RHF + Zod validation, inline field errors and success toasts across auth, onboarding, profile, addresses, preferences, notifications and order requests. Seed demo account password is `Demo123!`; never use real credentials.
- Added skippable 3-step onboarding for gender/style, usual sizes and favourite categories. Completed preferences feed a personalized homepage “For you” rail and can be edited in account settings.
- Added responsive customer account navigation with desktop sidebar and mobile bottom-sheet menu; profile edit, address CRUD/default selection, order list/detail, tracking timeline, cancellation/return/exchange requests recorded as pending review without changing order status, printable invoice, wishlist, reviews, order activity and notification preferences.
- Customer checkout now pre-fills the account's default saved address. New registrations are recognized by the demo session and role gate.
- Validation: production build, `npm run typecheck`, and targeted ESLint passed. Browser checks covered registration, onboarding completion, the personalized homepage rail, protected account access, adding a default address, and submitting a return request then seeing it in order history without changing the order status. API checks covered the demo registration and password-reset endpoints; the secure cookie was verified in a browser context.

## P9 seller workspace update
- Added `/sell` with seller benefits, the four-step application flow, an itemised commission example, seller FAQs and an apply/sign-in CTA. Commission copy and figures are driven by `COMMERCE.defaultCommissionRate`.
- Added `/merchant/register`, a five-step RHF + Zod application covering owner account, business details (GSTIN or unregistered declaration, PAN), bank and pickup address, brand story/logo, supporting-document previews and terms. New applications create a pending seller and session, then land on `/merchant/pending`; invalid steps are revisited automatically on submit.
- Added role-aware merchant sign-in: `/api/auth/login` returns `/merchant/dashboard` for merchants, and `/login` shows the seeded seller demo hint. `/merchant` redirects to the dashboard.
- Added the approved-only merchant shell and workspace: `/merchant/dashboard` (net sales, order counts, sales/orders bar charts, payout snapshot, low-stock alerts and recent orders), `/merchant/products`, `/merchant/products/new`, `/merchant/products/[id]/edit`, `/merchant/orders`, `/merchant/payouts`, `/merchant/profile` and `/merchant/notifications`. Pending sellers are redirected to the pending screen; unauthenticated visitors go to login.
- Products: searchable/filterable catalogue with status tabs, bulk publish/draft/delete, table and card views, create/edit with simulated multi-image upload, cover badge, drag or button reordering, a colour × size variant matrix (SKU, stock, per-variant price), fabric/fit/care, story, SEO fields, draft/publish controls and an inert live `ProductCard` preview. Colours renamed in the editor migrate their variant keys.
- Orders: seller order lines show item, colour/size and estimated payout; the flow supports accept, mark packed, ship with validated courier/AWB, mark delivered, record a return request and confirm the returned parcel. Status summary cards and notifications reflect each transition.
- Payouts: statement totals, per-line commission and payout estimates, and a mock `format=csv` export with a BOM, quoted cells and no-store caching. Returned/cancelled lines are shown with a dash and excluded from totals.
- Storefront profile: editable public name, city, brand story and logo with a live preview, plus a link to the public `/merchant/[slug]/store` for seeded merchants.
- Merchant data lives in `src/lib/demo-merchant-store.ts` (process memory, DEMO ONLY); Zod contracts live in `src/lib/merchant-schemas.ts`, and `src/lib/merchant-access.ts` provides merchant/approved-merchant guards. APIs are under `/api/merchant/{applications,products,orders/[id],payouts,profile,notifications}`. Every new route has a branded loading state.
- Validation: `npm run typecheck`, targeted ESLint, and `npm run build` passed. Browser and API checks covered the public seller page, a complete application to the pending screen, 403s for pending-merchant APIs, product create/edit/publish/public rendering/bulk delete, the accept → pack → ship (courier/AWB) → deliver flow, return request and confirmation, notification read state, storefront profile save and CSV export.

## P10 admin studio update
- Added `/admin`, gated in `src/app/admin/layout.tsx` by `getAdminIdentity()`. The demo session must be an admin and the account must still carry the admin role; otherwise the layout redirects to `/login?next=%2Fadmin`. Seeded admin: `admin@example.test` / `Demo123!`.
- Added a responsive admin shell with grouped navigation (Marketplace, Commerce, Platform) and a shared `DataTable` that renders tables on desktop and stacked cards on mobile. Admin routes have branded `loading.tsx` and `error.tsx` states.
- Dashboard: paid GMV, commission earned, pending merchants, moderation queue, customers, active merchants, flagged reviews and total orders, plus recent orders, merchant approvals and attention shortcuts.
- Merchants: searchable list and detail with business, bank, pickup and document data; document verification; approve, reject with a reason, suspend and reactivate; per-merchant commission override. Status changes propagate to the seller workspace guard and public catalogue.
- Commissions: global default rate and per-merchant overrides. Settings: commission, GST slabs, free-delivery threshold, standard shipping fee, return window and delivery days; these values feed cart, checkout, order creation, shipping and returns.
- Moderation and products: draft/live moderation queue plus full product CRUD. The editor reuses `MerchantProductEditor` with `mode="admin"` for Sharda Garments listings. Catalog manages categories and collections; Content manages banners, stories, featured collections and the announcement bar.
- Commerce: all-orders view with combined filters; estimated payouts; coupon create/pause/scope/delete feeding bag and checkout validation; review hide/restore/flag decisions; read-only customer list with spend derived from orders.
- State lives in `src/lib/admin-store.ts` on `globalThis` (process memory, DEMO ONLY). Public repositories read the same categories, collections, banners, stories and coupons, so admin edits appear across the storefront in the running process and reset on restart. Seed orders gained `address` and `merchantOrders` so orders and payouts have realistic rows.
- Zod contracts live in `src/lib/admin-schemas.ts`; APIs are under `/api/admin/{merchants,catalog,content,coupons,products,reviews,settings}`. Client managers submit, then call `router.refresh()` so server components re-read the store.
- Validation: `npm run typecheck`, `npm run lint` and `npm run build` pass. Browser checks covered the admin gate, dashboard, merchant approval and suspension, document verification, commission overrides, product create/edit/publish/delete, catalogue and content edits, coupon pause, review decisions, settings persistence across a refresh, and the desktop table / mobile card switch.

## P11 information pages, SEO and QA
- Added nine information routes on the shared `InfoPage` shell (breadcrumbs, intro, sticky “On this page” contents and section anchors): `/about`, `/contact`, `/shipping`, `/returns`, `/privacy`, `/terms`, `/size-guide`, `/faq` and `/track`, plus journal routes `/stories` and `/stories/[slug]` so the homepage and footer story links no longer 404. Copy is written for the demo and shows a reviewed date.
- `/contact` posts to `/api/contact`; `/track` posts order number plus checkout email to `/api/track-order`. Both validate with Zod, show inline errors and a success toast, and are DEMO ONLY: messages are acknowledged and discarded, and tracking only matches an in-process order with the exact checkout email.
- SEO is centralised in `src/lib/seo.ts` (`SITE_URL`, `absoluteUrl`, `pageMetadata`, `privateMetadata`, `breadcrumbJsonLd`). Every route declares metadata; private areas (account, admin, merchant workspace, auth, cart, checkout, search, styleguide) are noindex. The root layout sets `metadataBase` and the `%s | SELVARQ` title template, so page titles never repeat the brand.
- Every public route has a canonical URL plus Open Graph and Twitter cards. The default share image is `public/brand/og-default.png` (1200×630); product pages fall back to it because seeded product art is SVG. `src/app/icon.png` and `src/app/apple-icon.png` provide the favicon and touch icon.
- `src/app/sitemap.ts` publishes 86 crawlable URLs (home, shop, categories, collections, products, storefronts, journal, sell and information pages) with last-modified and priority. `src/app/robots.ts` disallows the private surfaces and points at the sitemap.
- JSON-LD is rendered by the server-only `JsonLd` component, which escapes `<`. Emitted: Organization and WebSite with SearchAction on the homepage, ItemList for featured products, BreadcrumbList on listing, product and information pages, Product with offers and ratings on product pages, and FAQPage on `/faq`.
- Accessibility fixes across the app: darkened `--muted` (#5f5f75) and `--gold-ink` (#785a16) so small text passes AA on ivory, pearl and soft gold; the story reveal no longer animates opacity; labelled spans and divs got valid `role="img"`/`role="group"`; carousel dots have 24×24 hit areas; the carousel rail is a focusable region that responds to arrow keys; review sort and sign-in targets are at least 36–44px; product-card colour swatches are 24px at base; all UI text is at least 11px; the product rating link no longer overrides its visible text with an `aria-label`.
- Keyboard paths verified in the browser: Enter on the menu button opens the native dialog, focus moves to Close, Escape closes it and returns focus to the trigger; ArrowRight on the hero rail scrolls it (0 → 896.8px).
- Performance: every image still goes through `MediaImage` with explicit ratios and `sizes`, and LCP images use Next 16 `preload`. The root `loading.tsx` moved to `src/app/(home)/loading.tsx` so prerendered pages ship complete HTML with no Suspense wrapper. First-load JS (uncompressed / gzip): 791/248 KB for `/about`, 793/250 KB for `/stories`, 832/262 KB for `/`, 835/262 KB for `/shop`, 850/266 KB for a product page and 946/295 KB for `/admin`. CSS is 83 KB; all JS chunks total 1,511 KB.
- Responsive QA at 360, 390, 768, 1024 and 1280 across 16 routes (plus the journal routes at 360, 768 and 1280): no page-level horizontal overflow, one `h1` and one `main` in the settled DOM, no missing `alt` and no text below 11px. Fixes from this pass: colour swatches shrink to 24px and hide the “+N” count under `sm`, and the empty-bag message is an `h2` instead of a second `h1`.
- Lighthouse (mobile) on `/`, `/shop`, `/product/[slug]`, `/about`, `/contact`, `/faq`, `/track`, `/size-guide`, `/cart`, `/privacy`, `/terms`, `/returns`, `/shipping`, `/stories` and `/stories/[slug]`: accessibility 100, best practices 100, SEO 100, zero failing audits.
- Validation: `npm run typecheck`, `npm run lint` and `npm run build` pass; the build emits 117 pages with `/`, `/shipping`, `/returns`, `/stories` and `/stories/[slug]` dynamic. Browser and API checks covered the contact form (toast “Message received”), tracking (the seeded order returns `SVQ-25-10021`, a wrong email returns 404), the admin gate and all 15 admin routes, and a settings change reflected on `/shipping` then reverted. An internal link crawl over 72 same-origin links found no 404s after adding the journal routes and pointing “Browse all collections” at `/shop`; console checks on the main routes are clean.

### P11 QA checklist

| Route | Render | 360–1280 | A11y | SEO | Notes |
| --- | --- | --- | --- | --- | --- |
| `/` | dynamic | pass | pass | pass | Organization, WebSite + SearchAction, ItemList |
| `/shop` | dynamic | pass | pass | pass | filter sidebar, listing breadcrumbs |
| `/category/[slug]` | dynamic | pass | pass | pass | canonical per category |
| `/collection/[slug]` | dynamic | pass | pass | pass | canonical per collection |
| `/product/[slug]` | dynamic | pass | pass | pass | Product + BreadcrumbList, gallery, reviews |
| `/search` | dynamic | pass | pass | pass | noindex + robots disallow |
| `/cart` | static shell | pass | pass | pass | empty and filled states |
| `/wishlist` | static shell | pass | pass | pass | empty state |
| `/checkout` | dynamic | pass | pass | pass | noindex, validated steps |
| `/order/[id]/confirmation` | dynamic | pass | pass | pass | noindex |
| `/merchant/[slug]/store` | dynamic | pass | pass | pass | approved makers only |
| `/sell` | static | pass | pass | pass | seller landing |
| `/merchant/register`, `/merchant/pending` | static | pass | pass | pass | noindex |
| `/login`, `/register`, `/forgot-password`, `/reset-password`, `/onboarding` | mixed | pass | pass | pass | noindex |
| `/account/*` | dynamic | pass | pass | pass | noindex, loading states |
| `/merchant/*` workspace | dynamic | pass | pass | pass | noindex, loading states |
| `/admin/*` | dynamic | pass | pass | pass | noindex, 15 routes |
| `/about` | static | pass | pass | pass | BreadcrumbList |
| `/contact` | static | pass | pass | pass | form posts to `/api/contact` |
| `/shipping` | dynamic | pass | pass | pass | live admin settings |
| `/returns` | dynamic | pass | pass | pass | live admin settings |
| `/privacy` | static | pass | pass | pass | |
| `/terms` | static | pass | pass | pass | |
| `/size-guide` | static | pass | pass | pass | |
| `/faq` | static | pass | pass | pass | FAQPage JSON-LD |
| `/track` | static | pass | pass | pass | form posts to `/api/track-order` |
| `/stories` | dynamic | pass | pass | pass | journal list |
| `/stories/[slug]` | dynamic | pass | pass | pass | Article + BreadcrumbList |
| `/styleguide` | static | n/a | n/a | pass | noindex reference page |

Pass = no page-level overflow at any tested width, one `h1`, one `main`, all images with `alt`, no text below 11px, no Lighthouse accessibility or SEO failures, and no browser console errors.

## React `use()` console warning (investigated, no app fix)

- The reported React 19 error 607 (`This library called use() to suspend in a previous render but did not call use() when it finished`) could not be reproduced with a fresh admin session across `/`, `/shop`, `/stories`, all key admin routes, client-side nav, logout/login, or image URL import; console checks were clean.
- There are no `use()` calls in `src`. The conditional `use()` instrumentation lives in Next 16's dev-only Suspense DevTools code in `node_modules/next/dist/client/components/navigation.js` (`NODE_ENV !== 'production'`) and `layout-router.js`, which unwrap deferred RSC promises with `use()` and can skip the call after a hot reload or route transition resolves the promise.
- No source-mapped stack pointing at app code was captured. Treat as a Next 16.4.6 Turbopack dev/HMR warning unless it recurs in production or with a stack that identifies an app component. If it does, capture the console message source URL/line and the exact route/action first.

## Product publish validation message
- Publishing a product with fewer than 3 images used to show the raw Zod text `Too small: expected array to have >=3 items`.
- `merchantProductSchema` (`src/lib/merchant-schemas.ts`) now supplies field-specific messages, including `Add at least 3 product images.` `MerchantProductEditor` prefixes the first issues with a friendly field label and shows up to two. The imagery section and publish sidebar show the live `x/3 minimum` count and how many images are still needed.
- Verified in the browser: removing one image from a seeded product then clicking **Publish listing** shows `Images: Add at least 3 product images.`, and `POST /api/admin/products` returns the same message. Validation failure saves nothing, so the stored product is unchanged.
