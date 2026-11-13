# SELVARQ: project context (stable facts)

Read this and PROGRESS.md at the start of every phase. Do not re-read the codebase; use ls, grep, targeted reads.

## Brand
- SELVARQ, premium multi-vendor fashion marketplace for India. INR, locale en-IN.
- Tagline "Premium Clothing." Footer line "SELVARQ, a brand of Sharda Garments."
- Own catalogue sold by Sharda Garments (seller id `sharda-garments`). Approved merchants can list their own.
- Voice: warm, confident, concise, craft-led. Product copy always names fabric, fit, care. No filler, no emoji in UI.
- Microcopy lives in `src/data/copy.ts`. Commerce constants live in `src/lib/config.ts`.

## Stack
Next.js 16.4.6 (App Router, Turbopack), React 19, TypeScript strict, Tailwind v4, zod, react-hook-form + @hookform/resolvers, zustand, framer-motion (toast only so far), lucide-react, clsx, tailwind-merge, date-fns, embla-carousel-react.
P13 only: mongoose, MongoDB Atlas, cloudinary, jose, bcryptjs. Do not install before.
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
src/lib/            config.ts format.ts utils.ts env.ts media.ts fonts.ts  repo/ (P1)
src/data/           copy.ts, stories.ts (brand story chapters), homepage.ts, mock fixtures
src/store/          toast-store.ts, cart/wishlist/ui/recently-viewed stores
src/types/          common user merchant catalog review order marketing index
src/hooks/          use-modal-dialog.ts
src/styles/         overlays.css (native <dialog> motion for Sheet + Dialog)
public/brand/       logo.png, monogram.png (optional; auto-detected)
```

## Conventions
- Files under ~250 lines. Kebab-case file names, PascalCase components, named exports (default only for Next route files).
- Money = integer paise (`Paise`). Dates = ISO strings. Format only via `src/lib/format.ts`.
- Prices are GST-inclusive in the UI; GST breakup at checkout and on invoices.
- Every image goes through `<MediaImage>`. Mock data uses `placeholder:<seed>` ids (generated art, no network).
- Mock media ids are served locally by `/api/placeholder/[id]` as branded SVG tiles; retain `placeholder:` ids until Cloudinary is wired in P13.
- Class merging via `cn()`. Forms: react-hook-form + zod schema; map errors to the `error` prop of inputs.
- Every route gets `loading.tsx`; `error.tsx` where relevant; branded `not-found.tsx`.
- Env: `DATA_SOURCE=mock|mongo` (validated in `src/lib/env.ts`), `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`.

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
- `Price` (price, mrp, size, showTaxNote), `QuantityStepper` (value, onChange, min, max), `Logo` (variant wordmark|monogram, size, tone, href, priority), `MediaImage` (src, alt, ratio, sizes, priority, fit).
- Shared `ProductCard` lives in `src/components/product/product-card.tsx`; use it across home, listing, wishlist and related-product surfaces.

## Route map
Built: global responsive shell (announcement, header, menus, search/cart overlays, mobile tabs, footer, consent and scroll-to-top), `/` (editorial homepage with a preference-personalized “For you” rail), `/shop`, `/category/[slug]`, `/collection/[slug]`, `/search`, `/product/[slug]`, `/cart`, `/wishlist`, `/checkout`, `/order/[id]/confirmation`, `/merchant/[slug]/store` (public approved-maker storefront), `/sell` (seller landing), `/merchant` (dashboard redirect), `/merchant/register`, `/merchant/pending`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/onboarding`, `/account` (profile, addresses, orders, order details/tracking, printable invoices, wishlist, reviews, notifications, preferences), `/merchant/dashboard`, `/merchant/products`, `/merchant/products/new`, `/merchant/products/[id]/edit`, `/merchant/orders`, `/merchant/payouts`, `/merchant/profile`, `/merchant/notifications`, and `/styleguide` (noindex). `/c/[slug]`, `/collections/[slug]`, and `/p/[slug]` redirect to canonical category, collection, and product routes. Root and new routes include branded loading states; root `error.tsx` and `not-found.tsx` provide branded route states.
Planned: `/orders/[id]`, `/track`, `/stories`, `/stories/[slug]`, `/admin/*`, info pages (about, shipping, returns, privacy, terms, contact).

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
- Merchant state is process-memory only in `src/lib/demo-merchant-store.ts`; schemas are in `src/lib/merchant-schemas.ts`; guards are in `src/lib/merchant-access.ts`. Uploads store file names only and render local placeholder previews; nothing is transmitted or persisted. Replace this store, add admin approval, and use real object storage in P13.
