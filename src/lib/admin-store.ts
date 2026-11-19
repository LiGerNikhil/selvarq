import { banners as seedBanners, categories as seedCategories, collections as seedCollections, coupons as seedCoupons, merchants as seedMerchants, products as seedProducts, stories as seedStories } from "@/data";
import type { Banner, Category, Collection, Coupon, Merchant, Product, Story } from "@/data";
import { COMMERCE, PLATFORM_SELLER, type GstSlab } from "@/lib/config";
import { demoDataEnabled } from "@/lib/demo-data";
import { markDirty } from "@/lib/db/persistence";
import { groupRecords, type EntityInput, type EntityRecord } from "@/lib/db/types";

export type AdminMerchantDocumentType = "gst_certificate" | "pan_card" | "cancelled_cheque" | "address_proof" | "other";

export interface AdminMerchantDocument {
  id: string;
  type: AdminMerchantDocumentType;
  fileName: string;
  uploadedAt: string;
  verified: boolean;
}

export interface AdminMerchant extends Merchant {
  businessName: string;
  email?: string;
  phone?: string;
  gstDeclaration: "registered" | "unregistered";
  gstin?: string;
  pan: string;
  bank: { accountHolder: string; accountNumber: string; ifsc: string; bankName: string };
  pickupAddress: { line1: string; city: string; state: string; pincode: string };
  documents: AdminMerchantDocument[];
  commissionRate: number;
  ownerUserId?: string;
  rejectionReason?: string;
  approvedAt?: string;
}

export interface AdminCollection extends Collection {
  featured: boolean;
}

export type AdminReviewStatus = "visible" | "hidden" | "flagged";

export interface AdminSettings {
  defaultCommissionRate: number;
  gstSlabs: GstSlab[];
  freeDeliveryThreshold: number;
  standardShippingFee: number;
  returnWindowDays: number;
  deliveryDays: { min: number; max: number };
}

export interface AdminAnnouncement {
  active: boolean;
  offers: { id: string; text: string; href: string }[];
}

export interface AdminProductInput {
  id?: string;
  name: string;
  categoryId: string;
  description: string;
  story: string;
  imageIds: string[];
  colors: { name: string; hex: string }[];
  sizes: Product["sizes"];
  variants: Product["variants"];
  price: number;
  mrp: number;
  fabric: string;
  fit: string;
  care: string[];
  highlights: string[];
  tags: string[];
  seo: Product["seo"];
  status: Product["status"];
  collectionIds?: string[];
}

export interface AdminMerchantApplicationInput {
  id: string;
  ownerUserId: string;
  merchantId: string;
  ownerName: string;
  email: string;
  phone: string;
  businessName: string;
  displayName: string;
  city: string;
  bio: string;
  logoId: string;
  gstDeclaration: "registered" | "unregistered";
  gstin?: string;
  pan: string;
  bank: AdminMerchant["bank"];
  pickupAddress: AdminMerchant["pickupAddress"];
  documents: { type: string; fileName: string }[];
  createdAt: string;
}

interface AdminState {
  merchants: AdminMerchant[];
  products: Record<string, Product>;
  deletedProductIds: string[];
  categories: Category[];
  collections: AdminCollection[];
  banners: Banner[];
  stories: Story[];
  coupons: Coupon[];
  reviewStatus: Record<string, AdminReviewStatus>;
  settings: AdminSettings;
  announcement: AdminAnnouncement;
}

const globalStore = globalThis as typeof globalThis & { __selvarqAdminStore?: AdminState };

function seedDocuments(merchantId: string, approved: boolean): AdminMerchantDocument[] {
  const uploadedAt = "2025-01-10T09:00:00.000Z";
  return [
    { id: `${merchantId}-pan`, type: "pan_card", fileName: "pan-card.pdf", uploadedAt, verified: approved },
    { id: `${merchantId}-gst`, type: "gst_certificate", fileName: "gst-certificate.pdf", uploadedAt, verified: approved },
    { id: `${merchantId}-cheque`, type: "cancelled_cheque", fileName: "cancelled-cheque.jpg", uploadedAt, verified: approved },
  ];
}

function seedAdminMerchants(): AdminMerchant[] {
  if (!demoDataEnabled()) return [];
  return seedMerchants.map((merchant, index) => ({
    ...merchant,
    businessName: merchant.name,
    email: merchant.id === "sharda-garments" ? "kavita@shardag.example.test" : `hello+${merchant.slug}@example.test`,
    phone: `98765000${String(index + 11).padStart(2, "0")}`,
    gstDeclaration: "registered",
    gstin: `27ABCDE${String(1234 + index)}F1Z${index % 10}`.slice(0, 14) + "5",
    pan: `ABCDE${String(1234 + index)}F`,
    bank: {
      accountHolder: merchant.name,
      accountNumber: `50100234${String(560 + index)}`,
      ifsc: "HDFC0001234",
      bankName: "HDFC Bank",
    },
    pickupAddress: {
      line1: `${12 + index}, Market Road`,
      city: merchant.city,
      state: index % 2 === 0 ? "Rajasthan" : "Maharashtra",
      pincode: index % 2 === 0 ? "302001" : "400001",
    },
    documents: seedDocuments(merchant.id, merchant.status === "approved"),
    commissionRate: COMMERCE.defaultCommissionRate,
    ownerUserId: merchant.id === "sharda-garments" ? "user-sharda-owner" : undefined,
    ...(merchant.status === "rejected" ? { rejectionReason: "Supporting business details were incomplete." } : {}),
  }));
}

function seedSettings(): AdminSettings {
  return {
    defaultCommissionRate: COMMERCE.defaultCommissionRate,
    gstSlabs: COMMERCE.gstSlabs.map((slab) => ({ ...slab })),
    freeDeliveryThreshold: COMMERCE.freeDeliveryThreshold,
    standardShippingFee: COMMERCE.standardShippingFee,
    returnWindowDays: COMMERCE.returnWindowDays,
    deliveryDays: { ...COMMERCE.deliveryDays },
  };
}

function createAdminState(): AdminState {
  const demo = demoDataEnabled();
  return {
    merchants: seedAdminMerchants(),
    products: {},
    deletedProductIds: [],
    categories: demo ? seedCategories.map((category) => ({ ...category })) : [],
    collections: demo ? seedCollections.map((collection) => ({ ...collection, productIds: [...collection.productIds], featured: true })) : [],
    banners: demo ? seedBanners.map((banner) => ({ ...banner })) : [],
    stories: demo ? seedStories.map((story) => ({ ...story, tags: [...story.tags] })) : [],
    coupons: demo ? seedCoupons.map((coupon) => ({ ...coupon })) : [],
    reviewStatus: {},
    settings: seedSettings(),
    announcement: demo
      ? {
          active: true,
          offers: [
            { id: "announcement-delivery", text: "Complimentary delivery on orders above Rs 1,999", href: "/shop" },
            { id: "announcement-makers", text: "Discover considered pieces from independent Indian makers", href: "/shop" },
            { id: "announcement-returns", text: "Easy returns within 7 days on eligible items", href: "/shipping" },
          ],
        }
      : { active: false, offers: [] },
  };
}

function getState(): AdminState {
  globalStore.__selvarqAdminStore ??= createAdminState();
  return globalStore.__selvarqAdminStore;
}

/** Queues a MongoDB write of the current admin state. */
function persistAdminState(): void {
  markDirty("admin", adminDocuments);
}

/** The full admin state as MongoDB records, one document per entity. */
export function adminDocuments(): EntityInput[] {
  const state = getState();
  return [
    ...getAdminMerchants().map((merchant, index) => ({ kind: "merchants", entityId: merchant.id, position: index, data: merchant })),
    ...getAdminProducts().map((product, index) => ({ kind: "products", entityId: product.id, position: index, data: product })),
    ...state.categories.map((category, index) => ({ kind: "categories", entityId: category.id, position: index, data: category })),
    ...state.collections.map((collection, index) => ({ kind: "collections", entityId: collection.id, position: index, data: collection })),
    ...state.banners.map((banner, index) => ({ kind: "banners", entityId: banner.id, position: index, data: banner })),
    ...state.stories.map((story, index) => ({ kind: "stories", entityId: story.id, position: index, data: story })),
    ...state.coupons.map((coupon, index) => ({ kind: "coupons", entityId: coupon.id, position: index, data: coupon })),
    ...Object.entries(state.reviewStatus).map(([id, status]) => ({ kind: "reviewStatus", entityId: id, data: status })),
    { kind: "settings", entityId: "singleton", data: state.settings },
    { kind: "announcement", entityId: "singleton", data: state.announcement },
  ];
}

/**
 * Rebuilds the admin working set from MongoDB. Products are stored as the
 * effective catalogue, so a seed product missing from the database was deleted.
 */
export function applyAdminDocuments(records: EntityRecord[]): void {
  const state = createAdminState();
  const grouped = groupRecords(records);
  const list = <T>(kind: string): T[] => (grouped.get(kind) ?? []).map((record) => record.data as T);

  state.merchants = list<AdminMerchant>("merchants");
  state.categories = list<Category>("categories");
  state.collections = list<AdminCollection>("collections");
  state.banners = list<Banner>("banners");
  state.stories = list<Story>("stories");
  state.coupons = list<Coupon>("coupons");

  const products = list<Product>("products");
  state.products = Object.fromEntries(products.map((product) => [product.id, product]));
  const storedProductIds = new Set(products.map((product) => product.id));
  state.deletedProductIds = seedProducts.filter((product) => !storedProductIds.has(product.id)).map((product) => product.id);

  const reviewStatus = grouped.get("reviewStatus");
  if (reviewStatus) {
    state.reviewStatus = Object.fromEntries(reviewStatus.map((record) => [record.entityId, record.data as AdminReviewStatus]));
  }
  const settings = grouped.get("settings")?.[0]?.data as AdminSettings | undefined;
  if (settings) state.settings = settings;
  const announcement = grouped.get("announcement")?.[0]?.data as AdminAnnouncement | undefined;
  if (announcement) state.announcement = announcement;

  globalStore.__selvarqAdminStore = state;
}

function slugify(value: string) {
  return value.toLocaleLowerCase("en-IN").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function getAdminSettings(): AdminSettings {
  const settings = getState().settings;
  return { ...settings, gstSlabs: settings.gstSlabs.map((slab) => ({ ...slab })), deliveryDays: { ...settings.deliveryDays } };
}

export function updateAdminSettings(patch: AdminSettings): void {
  getState().settings = {
    ...patch,
    gstSlabs: patch.gstSlabs.map((slab) => ({ ...slab })),
    deliveryDays: { ...patch.deliveryDays },
  };
  persistAdminState();
}

export function getAdminAnnouncement(): AdminAnnouncement {
  const announcement = getState().announcement;
  return { ...announcement, offers: announcement.offers.map((offer) => ({ ...offer })) };
}

export function updateAdminAnnouncement(announcement: AdminAnnouncement): void {
  getState().announcement = { ...announcement, offers: announcement.offers.map((offer) => ({ ...offer })) };
  persistAdminState();
}

export function getAdminMerchants(): AdminMerchant[] {
  const order = { pending: 0, approved: 1, suspended: 2, rejected: 3 } as const;
  return [...getState().merchants].sort((a, b) => order[a.status] - order[b.status] || a.name.localeCompare(b.name));
}

export function getAdminMerchant(id: string): AdminMerchant | undefined {
  return getState().merchants.find((merchant) => merchant.id === id);
}

export function getAdminMerchantStatus(id: string): Merchant["status"] | undefined {
  return getAdminMerchant(id)?.status;
}

export function getAdminMerchantCommissionRate(id: string): number {
  return getAdminMerchant(id)?.commissionRate ?? getState().settings.defaultCommissionRate;
}

export function registerAdminMerchantApplication(input: AdminMerchantApplicationInput): void {
  const state = getState();
  if (state.merchants.some((merchant) => merchant.id === input.merchantId)) return;
  state.merchants.push({
    id: input.merchantId,
    name: input.displayName,
    slug: input.merchantId,
    status: "pending",
    bio: input.bio,
    city: input.city,
    logoId: input.logoId,
    rating: { average: 0, count: 0 },
    joinedAt: input.createdAt,
    businessName: input.businessName,
    email: input.email.toLowerCase(),
    phone: input.phone,
    gstDeclaration: input.gstDeclaration,
    ...(input.gstin ? { gstin: input.gstin } : {}),
    pan: input.pan,
    bank: { ...input.bank },
    pickupAddress: { ...input.pickupAddress },
    documents: input.documents.map((document, index) => ({
      id: `${input.merchantId}-document-${index + 1}`,
      type: document.type as AdminMerchantDocumentType,
      fileName: document.fileName,
      uploadedAt: input.createdAt,
      verified: false,
    })),
    commissionRate: state.settings.defaultCommissionRate,
    ownerUserId: input.ownerUserId,
  });
  persistAdminState();
}

export interface AdminMerchantSeed {
  id: string;
  ownerUserId: string;
  name: string;
  email: string;
  city: string;
  bio: string;
  logoId: string;
  status?: Merchant["status"];
}

/**
 * Creates an already-approved merchant for the production seller account.
 * Existing records are left untouched so admin edits survive a restart.
 */
export function ensureAdminMerchant(input: AdminMerchantSeed): AdminMerchant {
  const state = getState();
  const existing = state.merchants.find(
    (merchant) => merchant.id === input.id || merchant.email?.toLowerCase() === input.email.toLowerCase(),
  );
  if (existing) return existing;

  const now = new Date().toISOString();
  const merchant: AdminMerchant = {
    id: input.id,
    name: input.name,
    slug: input.id,
    status: input.status ?? "approved",
    bio: input.bio,
    city: input.city,
    logoId: input.logoId,
    rating: { average: 0, count: 0 },
    joinedAt: now,
    businessName: input.name,
    email: input.email.toLowerCase(),
    phone: "",
    gstDeclaration: "unregistered",
    pan: "AAAAA0000A",
    bank: { accountHolder: input.name, accountNumber: "", ifsc: "", bankName: "" },
    pickupAddress: { line1: "", city: input.city, state: "", pincode: "" },
    documents: [],
    commissionRate: state.settings.defaultCommissionRate,
    ownerUserId: input.ownerUserId,
    approvedAt: now,
  };
  state.merchants.push(merchant);
  persistAdminState();
  return merchant;
}

export function updateAdminMerchant(id: string, patch: { status?: Merchant["status"]; commissionRate?: number; rejectionReason?: string }): AdminMerchant | undefined {
  const merchant = getAdminMerchant(id);
  if (!merchant) return undefined;
  if (patch.status) {
    merchant.status = patch.status;
    if (patch.status === "approved") merchant.approvedAt = new Date().toISOString();
    if (patch.status !== "rejected") delete merchant.rejectionReason;
  }
  if (typeof patch.commissionRate === "number") merchant.commissionRate = patch.commissionRate;
  if (patch.rejectionReason !== undefined) merchant.rejectionReason = patch.rejectionReason;
  persistAdminState();
  return merchant;
}

export function verifyAdminMerchantDocument(merchantId: string, documentId: string, verified: boolean): AdminMerchantDocument | undefined {
  const document = getAdminMerchant(merchantId)?.documents.find((item) => item.id === documentId);
  if (document) document.verified = verified;
  persistAdminState();
  return document;
}

export function getAdminProducts(): Product[] {
  const state = getState();
  const demo = demoDataEnabled();
  const seedIds = new Set(demo ? seedProducts.map((product) => product.id) : []);
  const products = demo
    ? [
        ...seedProducts.map((product) => state.products[product.id] ?? product),
        ...Object.values(state.products).filter((product) => !seedIds.has(product.id)),
      ]
    : Object.values(state.products);
  return products.filter((product) => !state.deletedProductIds.includes(product.id));
}

export function getAdminProduct(id: string): Product | undefined {
  return getAdminProducts().find((product) => product.id === id);
}

export function registerAdminProduct(product: Product): void {
  const state = getState();
  state.products[product.id] = product;
  state.deletedProductIds = state.deletedProductIds.filter((id) => id !== product.id);
  persistAdminState();
}

export function removeAdminProduct(id: string): void {
  const state = getState();
  delete state.products[id];
  if (!state.deletedProductIds.includes(id)) state.deletedProductIds.push(id);
  persistAdminState();
}

export function getAdminProductSnapshot(): { products: Product[]; deletedIds: string[] } {
  const state = getState();
  return { products: Object.values(state.products), deletedIds: [...state.deletedProductIds] };
}

export function saveAdminProduct(input: AdminProductInput): Product {
  const state = getState();
  const existing = input.id ? getAdminProduct(input.id) : undefined;
  if (input.id && !existing) throw new Error("Product not found.");
  const id = existing?.id ?? `admin-product-${crypto.randomUUID()}`;
  // Admin-created products belong to the brand's approved seller. Without a
  // matching merchant record the storefront cannot resolve the seller and the
  // product page would 404, so prefer the configured platform seller and fall
  // back to any approved merchant.
  const merchantId = existing?.merchantId
    ?? state.merchants.find((merchant) => merchant.id === PLATFORM_SELLER.id && merchant.status === "approved")?.id
    ?? state.merchants.find((merchant) => merchant.status === "approved")?.id
    ?? PLATFORM_SELLER.id;
  const product: Product = {
    id,
    slug: existing?.slug ?? `${slugify(input.name)}-${id.slice(-6)}`,
    merchantId,
    collectionIds: input.collectionIds ?? existing?.collectionIds ?? [],
    rating: existing?.rating ?? { average: 0, count: 0 },
    name: input.name,
    categoryId: input.categoryId,
    description: input.description,
    story: input.story,
    imageIds: input.imageIds,
    colors: input.colors,
    sizes: input.sizes,
    variants: input.variants,
    price: input.price,
    mrp: input.mrp,
    fabric: input.fabric,
    fit: input.fit,
    care: input.care,
    highlights: input.highlights,
    tags: input.tags,
    seo: input.seo,
    status: input.status,
  };
  state.products[id] = product;
  state.deletedProductIds = state.deletedProductIds.filter((deletedId) => deletedId !== id);
  persistAdminState();
  return product;
}

export function updateAdminProductStatus(id: string, status: Product["status"]): Product | undefined {
  const product = getAdminProduct(id);
  if (!product) return undefined;
  const next = { ...product, status };
  getState().products[id] = next;
  persistAdminState();
  return next;
}

export function deleteAdminProduct(id: string): boolean {
  if (!getAdminProduct(id)) return false;
  removeAdminProduct(id);
  return true;
}

export function getAdminCategories(): Category[] {
  return getState().categories.map((category) => ({ ...category }));
}

export function saveAdminCategory(input: Omit<Category, "id"> & { id?: string }): Category {
  const state = getState();
  const existing = input.id ? state.categories.find((category) => category.id === input.id) : undefined;
  const category: Category = {
    id: existing?.id ?? `category-${crypto.randomUUID()}`,
    name: input.name,
    slug: input.slug || slugify(input.name),
    parentId: input.parentId || null,
    description: input.description,
    ...(input.imageId ? { imageId: input.imageId } : {}),
  };
  if (existing) state.categories[state.categories.indexOf(existing)] = category;
  else state.categories.push(category);
  persistAdminState();
  return category;
}

export function deleteAdminCategory(id: string): boolean {
  const state = getState();
  const index = state.categories.findIndex((category) => category.id === id);
  if (index < 0) return false;
  state.categories.splice(index, 1);
  persistAdminState();
  return true;
}

export function getAdminCollections(): AdminCollection[] {
  return getState().collections.map((collection) => ({ ...collection, productIds: [...collection.productIds] }));
}

export function saveAdminCollection(input: Omit<AdminCollection, "id" | "productIds"> & { id?: string; productIds?: string[] }): AdminCollection {
  const state = getState();
  const existing = input.id ? state.collections.find((collection) => collection.id === input.id) : undefined;
  const collection: AdminCollection = {
    id: existing?.id ?? `collection-${crypto.randomUUID()}`,
    name: input.name,
    slug: input.slug || slugify(input.name),
    description: input.description,
    imageId: input.imageId,
    productIds: input.productIds ?? existing?.productIds ?? [],
    featured: input.featured,
  };
  if (existing) state.collections[state.collections.indexOf(existing)] = collection;
  else state.collections.push(collection);
  persistAdminState();
  return collection;
}

export function deleteAdminCollection(id: string): boolean {
  const state = getState();
  const index = state.collections.findIndex((collection) => collection.id === id);
  if (index < 0) return false;
  state.collections.splice(index, 1);
  persistAdminState();
  return true;
}

export function getAdminBanners(): Banner[] {
  return getState().banners.map((banner) => ({ ...banner }));
}

export function saveAdminBanner(input: Omit<Banner, "id"> & { id?: string }): Banner {
  const state = getState();
  const banner: Banner = { ...input, id: input.id ?? `banner-${crypto.randomUUID()}` };
  const existing = input.id ? state.banners.find((item) => item.id === input.id) : undefined;
  if (existing) state.banners[state.banners.indexOf(existing)] = banner;
  else state.banners.push(banner);
  persistAdminState();
  return banner;
}

export function deleteAdminBanner(id: string): boolean {
  const state = getState();
  const index = state.banners.findIndex((banner) => banner.id === id);
  if (index < 0) return false;
  state.banners.splice(index, 1);
  persistAdminState();
  return true;
}

export function getAdminStories(): Story[] {
  return getState().stories.map((story) => ({ ...story, tags: [...story.tags] }));
}

export function saveAdminStory(input: Omit<Story, "id"> & { id?: string }): Story {
  const state = getState();
  const story: Story = { ...input, id: input.id ?? `story-${crypto.randomUUID()}` };
  const existing = input.id ? state.stories.find((item) => item.id === input.id) : undefined;
  if (existing) state.stories[state.stories.indexOf(existing)] = story;
  else state.stories.push(story);
  persistAdminState();
  return story;
}

export function deleteAdminStory(id: string): boolean {
  const state = getState();
  const index = state.stories.findIndex((story) => story.id === id);
  if (index < 0) return false;
  state.stories.splice(index, 1);
  persistAdminState();
  return true;
}

export function getAdminCoupons(): Coupon[] {
  return getState().coupons.map((coupon) => ({ ...coupon }));
}

export function saveAdminCoupon(input: Omit<Coupon, "id"> & { id?: string }): Coupon {
  const state = getState();
  const coupon: Coupon = { ...input, id: input.id ?? `coupon-${crypto.randomUUID()}`, code: input.code.toUpperCase() };
  const existing = input.id ? state.coupons.find((item) => item.id === input.id) : undefined;
  if (existing) state.coupons[state.coupons.indexOf(existing)] = coupon;
  else state.coupons.push(coupon);
  persistAdminState();
  return coupon;
}

export function deleteAdminCoupon(id: string): boolean {
  const state = getState();
  const index = state.coupons.findIndex((coupon) => coupon.id === id);
  if (index < 0) return false;
  state.coupons.splice(index, 1);
  persistAdminState();
  return true;
}

export function getAdminReviewStatus(id: string): AdminReviewStatus {
  return getState().reviewStatus[id] ?? "visible";
}

export function updateAdminReviewStatus(id: string, status: AdminReviewStatus): void {
  getState().reviewStatus[id] = status;
  persistAdminState();
}
