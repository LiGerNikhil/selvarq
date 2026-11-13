import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Accordion, type AccordionItem } from "@/components/ui/accordion";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPurchase } from "@/components/product/product-purchase";
import { ProductRecommendations, RecentlyViewed } from "@/components/product/product-related";
import { ProductReviews } from "@/components/product/product-reviews";
import { Rating } from "@/components/ui/rating";
import { collections, products } from "@/data";
import { getSession } from "@/lib/auth/demo-session";
import { BRAND, COMMERCE } from "@/lib/config";
import { formatINR } from "@/lib/format";
import {
  categoriesRepository,
  collectionsRepository,
  couponsRepository,
  merchantsRepository,
  ordersRepository,
  productsRepository,
  reviewsRepository,
} from "@/lib/repo";

type RouteProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return products.filter((product) => product.status === "active").map(({ slug }) => ({ slug }));
}

async function findProduct(slug: string) {
  return productsRepository.getBySlug(slug);
}

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await findProduct(slug);
  if (!product) return { title: "Piece not found" };
  const title = product.seo.title || `${product.name} | ${BRAND.name}`;
  const description = product.seo.description || product.description;
  return {
    title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      images: product.imageIds[0] ? [`/api/placeholder/${encodeURIComponent(product.imageIds[0].replace(/^placeholder:/, ""))}`] : undefined,
    },
  };
}

function ProductQuestions({ fabric, fit, care }: { fabric: string; fit: string; care: string[] }) {
  const items: AccordionItem[] = [
    { id: "feel", title: "What does the fabric feel like?", content: <p className="text-sm leading-6 text-muted">{fabric} is chosen for a comfortable feel and easy repeat wear. Natural fabrics may show subtle variations in texture.</p> },
    { id: "fit", title: "How does this piece fit?", content: <p className="text-sm leading-6 text-muted">{fit}. Please refer to the size guide and select the size that best matches your usual fit.</p> },
    { id: "care", title: "How should I care for it?", content: <ul className="list-inside list-disc space-y-1 text-sm leading-6 text-muted">{care.map((instruction) => <li key={instruction}>{instruction}</li>)}</ul> },
    { id: "delivery", title: "When will it arrive, and can I return it?", content: <p className="text-sm leading-6 text-muted">Estimated delivery is 3 to 7 days. Eligible items may be returned within 7 days of delivery, subject to the returns policy.</p> },
  ];
  return <section id="questions" className="py-10 md:py-14"><p className="eyebrow mb-2">Good to know</p><h2 className="display-lg mb-5 text-indigo">Questions & answers</h2><Accordion items={items} headingLevel={3} /></section>;
}

function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default async function ProductPage({ params }: RouteProps) {
  const { slug } = await params;
  const product = await findProduct(slug);
  if (!product) notFound();

  const [merchant, category, allCategories, activeCoupons, reviewPage, reviewSummary, session, similarPage, collectionProducts, allProducts] = await Promise.all([
    merchantsRepository.getById(product.merchantId),
    categoriesRepository.getById(product.categoryId),
    categoriesRepository.list(),
    couponsRepository.listActive(),
    reviewsRepository.list({ productId: product.id, pageSize: 100 }),
    reviewsRepository.summary(product.id),
    getSession(),
    productsRepository.search({ categoryId: product.categoryId, sort: "rating", pageSize: 12 }),
    product.collectionIds[0] ? collectionsRepository.getProducts(product.collectionIds[0]) : Promise.resolve([]),
    productsRepository.search({ pageSize: 100 }),
  ]);
  if (!merchant || merchant.status !== "approved" || !category) notFound();

  const rootCategory = category.parentId ? allCategories.find((item) => item.id === category.parentId) : undefined;
  const collection = collections.find((item) => product.collectionIds.includes(item.id));
  const deliveredOrders = session?.role === "customer"
    ? await ordersRepository.list({ userId: session.userId, status: "delivered", pageSize: 100 })
    : null;
  const canReview = Boolean(deliveredOrders?.items.some((order) => order.items.some((item) => item.productId === product.id)));
  const similar = similarPage.items.filter((item) => item.id !== product.id).slice(0, 4);
  const alsoViewed = collectionProducts.filter((item) => item.id !== product.id).slice(0, 4);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const productUrl = new URL(`/product/${product.slug}`, baseUrl).toString();
  const inStock = product.variants.some((variant) => variant.stock > 0);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.imageIds.map((id) => new URL(`/api/placeholder/${encodeURIComponent(id.replace(/^placeholder:/, ""))}`, baseUrl).toString()),
    sku: product.variants[0]?.sku,
    brand: { "@type": "Brand", name: BRAND.name },
    category: category.name,
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "INR",
      price: (product.price / 100).toFixed(2),
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: merchant.name },
    },
    aggregateRating: product.rating.count ? {
      "@type": "AggregateRating",
      ratingValue: product.rating.average,
      reviewCount: product.rating.count,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
  };
  const accordions: AccordionItem[] = [
    { id: "details", title: "Details", content: <div className="space-y-3 text-sm leading-6 text-muted"><p>{product.description}</p><ul className="list-inside list-disc space-y-1">{product.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul></div> },
    { id: "fabric-care", title: "Fabric & care", content: <div className="space-y-3 text-sm leading-6 text-muted"><p><strong className="text-ink">Fabric:</strong> {product.fabric}</p><p><strong className="text-ink">Fit:</strong> {product.fit}</p><ul className="list-inside list-disc space-y-1">{product.care.map((instruction) => <li key={instruction}>{instruction}</li>)}</ul></div> },
    { id: "shipping-returns", title: "Shipping & returns", content: <div className="space-y-2 text-sm leading-6 text-muted"><p>Most orders arrive within 3 to 7 business days. Delivery charges and serviceability are confirmed at checkout.</p><p>Eligible items may be returned within {COMMERCE.returnWindowDays} days of delivery if unused and with original tags. See our returns policy for full terms.</p></div> },
    { id: "seller", title: "About the seller", content: <div className="space-y-3 text-sm leading-6 text-muted"><p>{merchant.bio}</p><p>{merchant.city} · Selling on SELVARQ since {new Date(merchant.joinedAt).getFullYear()}</p><a href={`/merchant/${merchant.slug}/store`} className="inline-flex min-h-11 items-center text-indigo underline underline-offset-4">Visit {merchant.name}&apos;s storefront</a></div> },
  ];
  const categoriesForCrumbs = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    ...(rootCategory ? [{ label: rootCategory.name, href: `/category/${rootCategory.slug}` }] : []),
    { label: category.name, href: `/category/${category.slug}` },
    { label: product.name },
  ];

  return (
    <main className="pb-24 sm:pb-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }} />
      <div className="page-container pt-5 md:pt-8">
        <Breadcrumbs items={categoriesForCrumbs} className="mb-5" />
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] lg:gap-12">
          <ProductGallery images={product.imageIds} name={product.name} />
          <div className="lg:sticky lg:top-6">
            {collection ? <a href={`/collection/${collection.slug}`} className="eyebrow text-gold-ink hover:underline">{collection.name}</a> : <p className="eyebrow text-gold-ink">{category.name}</p>}
            <h1 className="display-lg mt-2 text-indigo">{product.name}</h1>
            <a href={`/merchant/${merchant.slug}/store`} className="mt-2 inline-flex min-h-11 items-center text-sm text-muted hover:text-indigo hover:underline">
              By <span className="ml-1 font-medium text-ink">{merchant.name}</span>
            </a>
            <a href="#reviews" className="mt-1 flex min-h-11 w-fit items-center gap-2 text-sm text-indigo underline-offset-4 hover:underline" aria-label={`Rated ${product.rating.average} out of 5, read ${product.rating.count} reviews`}>
              <Rating value={product.rating.average} size="sm" showValue />
              <span>({product.rating.count} reviews)</span>
            </a>
            <div className="my-4 border-y border-line py-4">
              <p className="mb-2 text-xs text-muted">GST inclusive</p>
              <p className="text-3xl font-medium text-ink">{formatINR(product.price)} <span className="text-sm font-normal text-muted">Inclusive of all taxes</span></p>
              {product.mrp > product.price ? <p className="mt-1 text-sm text-muted">MRP <s>{formatINR(product.mrp)}</s><span className="ml-2 font-medium text-burgundy">{Math.floor((product.mrp - product.price) / product.mrp * 100)}% off</span></p> : null}
            </div>
            <ProductPurchase product={product} coupons={activeCoupons} />
          </div>
        </div>

        <section className="my-12 grid gap-6 border-y border-line py-8 md:grid-cols-[0.7fr_1.3fr] md:gap-12 md:py-12">
          <div>
            <p className="eyebrow mb-2">Made with intention</p>
            <h2 className="display-lg text-indigo">The story behind this piece</h2>
          </div>
          <div className="space-y-4">
            <p className="font-display text-2xl leading-snug text-indigo md:text-3xl">“Good clothes earn their place through the way they feel, wear and last.”</p>
            <p className="text-sm leading-7 text-muted">{product.story}</p>
            <ul className="flex flex-wrap gap-2">{product.highlights.map((highlight) => <li key={highlight} className="border border-line bg-pearl px-3 py-2 text-xs text-ink">{highlight}</li>)}</ul>
          </div>
        </section>

        <section className="grid gap-6 border-b border-line pb-10 md:grid-cols-[0.55fr_1fr] md:gap-12">
          <div>
            <p className="eyebrow mb-2">Considered details</p>
            <h2 className="display-lg text-indigo">Product information</h2>
          </div>
          <Accordion items={accordions} type="single" headingLevel={3} />
        </section>

        <ProductQuestions fabric={product.fabric} fit={product.fit} care={product.care} />
        <ProductReviews productSlug={product.slug} productName={product.name} reviews={reviewPage.items} summary={reviewSummary} canReview={canReview} signedIn={Boolean(session)} />
        <ProductRecommendations title="Similar pieces" products={similar} />
        <ProductRecommendations title="Customers also viewed" products={alsoViewed} />
        <RecentlyViewed currentProductId={product.id} products={allProducts.items} />
      </div>
    </main>
  );
}
