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
- [ ] P10 to P12: not started (scope set by the user per phase)
- [ ] P13 MongoDB, Cloudinary, auth (mongoose, cloudinary, jose, bcryptjs)
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
5. `muted` on `pearl` is roughly 4.4:1, marginally under AA for small text. Prefer `ink` for small text on pearl.
6. Toasts render below an open Dialog or Sheet (top layer). Fix with the popover API if toasts must show over overlays.
7. Sheet and Dialog use native <dialog> with @starting-style transitions: needs Chrome 117+, Safari 17.5+, Firefox 129+ for animation; older browsers still work, without motion. Children stay mounted while closed.
8. Placeholders to confirm with the user: standard shipping fee (Rs 99), delivery window (3 to 7 days). GST slab bound is inclusive at Rs 2,500; the CA must confirm slabs and how the threshold is applied.
9. `<Logo />` image mode is decided when `next dev`/`next build` starts (reads public/brand). Restart dev after adding the PNGs. Only PNG is detected.
10. With Cloudinary enabled, URLs carry f_auto,q_auto and next/image also optimises; revisit in P13.
11. Product-detail review submissions remain demo-only and are not persisted; the UI states this explicitly.
12. Cart, wishlist, and mock orders persist only in browser storage or the running server process. They reset when local storage is cleared or the server restarts; P13 will replace mock persistence.
13. P8 authentication is DEMO ONLY: passwords, accounts, profile data, addresses, notification choices, and reset tokens are held in process memory; the unsigned httpOnly cookie and fixed mock OTP are not production authentication. Replace with persistent storage, password hashing, expiring signed sessions and a real OTP provider in P13.
14. P9 merchant data is DEMO ONLY: applications, listings, fulfilment state, storefront profiles, notifications and payout statements live in the server process and reset on restart. Uploaded logos and documents are represented by file names and local placeholder previews; no file is transmitted or stored.
15. P9 has no admin review screen. Newly registered merchants stay `pending` and see `/merchant/pending`; the seeded approved seller (`kavita@shardag.example.test` / `Demo123!`, Sharda Garments) demonstrates the workspace. CSV exports and payout figures are illustrative, not settlement instructions.
16. P9 commission is read from `COMMERCE.defaultCommissionRate` (12%) rather than hardcoded. Returned and cancelled lines are excluded from net sales, commission and payout totals, but remain visible in the statement with a dash.

## Next phase
P10: continue with the next user-scoped phase.

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
