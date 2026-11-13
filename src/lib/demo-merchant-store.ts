import type { Product } from "@/data";
import { merchants, orders, products } from "@/data";
import type { Order } from "@/data";
import { mockOrdersRepository } from "@/lib/repo/orders";
import { COMMERCE } from "@/lib/config";

export interface MerchantApplication {
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
  bank: { accountHolder: string; accountNumber: string; ifsc: string; bankName: string };
  pickupAddress: { line1: string; city: string; state: string; pincode: string };
  documents: { type: string; fileName: string }[];
  termsAccepted: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface MerchantProductInput {
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
}

export type MerchantFulfilmentStatus = "placed" | "accepted" | "packed" | "shipped" | "delivered" | "return_requested" | "returned";

export interface MerchantFulfilment {
  status: MerchantFulfilmentStatus;
  courier?: string;
  awb?: string;
  updatedAt: string;
}

export interface MerchantNotification {
  id: string;
  merchantId: string;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
}

interface DemoMerchantStore {
  applications: MerchantApplication[];
  products: Product[];
  deletedProductIds: string[];
  fulfilments: Record<string, MerchantFulfilment>;
  profiles: Record<string, Partial<Pick<MerchantApplication, "displayName" | "bio" | "city" | "logoId">>>;
  notifications: MerchantNotification[];
}

const globalStore = globalThis as typeof globalThis & { __selvarqMerchantStore?: DemoMerchantStore };

// DEMO ONLY: merchant applications, catalogue edits and fulfilment states live in process memory.
function getStore(): DemoMerchantStore {
  globalStore.__selvarqMerchantStore ??= { applications: [], products: [], deletedProductIds: [], fulfilments: {}, profiles: {}, notifications: [] };
  return globalStore.__selvarqMerchantStore;
}

export function saveMerchantApplication(application: MerchantApplication): void {
  getStore().applications.unshift(application);
}

export function getMerchantApplicationByOwner(ownerUserId: string): MerchantApplication | undefined {
  return getStore().applications.find((application) => application.ownerUserId === ownerUserId);
}

export function getMerchantApplicationByEmail(email: string): MerchantApplication | undefined {
  return getStore().applications.find((application) => application.email === email.toLowerCase());
}

export function listMerchantProducts(merchantId?: string): Product[] {
  return getStore().products.filter((product) => !merchantId || product.merchantId === merchantId);
}

export function getMerchantCatalogProducts(merchantId: string): Product[] {
  const store = getStore();
  const overrides = store.products.filter((product) => product.merchantId === merchantId);
  const overriddenIds = new Set(overrides.map((product) => product.id));
  return [
    ...overrides,
    ...products.filter((product) => product.merchantId === merchantId && !overriddenIds.has(product.id) && !store.deletedProductIds.includes(product.id)),
  ];
}

export function getPublicDemoProducts(): Product[] {
  const store = getStore();
  const overridesById = new Map(store.products.map((product) => [product.id, product]));
  return [
    ...products.filter((product) => !store.deletedProductIds.includes(product.id)).map((product) => overridesById.get(product.id) ?? product),
    ...store.products.filter((product) => !products.some((seed) => seed.id === product.id)),
  ];
}

export function saveMerchantProduct(merchantId: string, input: MerchantProductInput): Product {
  const store = getStore();
  const existing = input.id
    ? store.products.find((product) => product.id === input.id && product.merchantId === merchantId)
      ?? products.find((product) => product.id === input.id && product.merchantId === merchantId)
    : undefined;
  if (input.id && !existing) throw new Error("Product not found for this store.");
  const id = existing?.id ?? `seller-product-${crypto.randomUUID()}`;
  const slugBase = input.name.toLocaleLowerCase("en-IN").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const product: Product = {
    ...input,
    id,
    slug: existing?.slug ?? `${slugBase}-${id.slice(-6)}`,
    merchantId,
    collectionIds: [],
    rating: existing?.rating ?? { average: 0, count: 0 },
  };
  if (existing && store.products.includes(existing)) store.products[store.products.indexOf(existing)] = product;
  else store.products.unshift(product);
  store.deletedProductIds = store.deletedProductIds.filter((deletedId) => deletedId !== id);
  return product;
}

export function deleteMerchantProduct(merchantId: string, productId: string): boolean {
  const store = getStore();
  const exists = store.products.some((product) => product.id === productId && product.merchantId === merchantId)
    || products.some((product) => product.id === productId && product.merchantId === merchantId);
  if (!exists) return false;
  store.products = store.products.filter((product) => product.id !== productId);
  if (!store.deletedProductIds.includes(productId)) store.deletedProductIds.push(productId);
  return true;
}

export function getMerchantProfile(merchantId: string) {
  const base = merchants.find((merchant) => merchant.id === merchantId);
  const application = getStore().applications.find((item) => item.merchantId === merchantId);
  if (!base && !application) return undefined;
  const profile = getStore().profiles[merchantId];
  return {
    id: merchantId,
    name: profile?.displayName ?? base?.name ?? application?.displayName ?? "Your store",
    slug: base?.slug ?? application?.merchantId ?? merchantId,
    bio: profile?.bio ?? base?.bio ?? application?.bio ?? "",
    city: profile?.city ?? base?.city ?? application?.city ?? "",
    logoId: profile?.logoId ?? base?.logoId ?? application?.logoId ?? `placeholder:${merchantId}`,
    status: application?.status ?? base?.status ?? "pending",
    joinedAt: base?.joinedAt ?? application?.createdAt ?? new Date().toISOString(),
  };
}

export function updateMerchantProfile(merchantId: string, patch: { displayName: string; bio: string; city: string; logoId: string }): void {
  getStore().profiles[merchantId] = patch;
}

export interface MerchantOrderLine {
  order: Order;
  items: Order["items"];
  status: MerchantFulfilmentStatus;
  courier?: string;
  awb?: string;
  subtotal: number;
  commission: number;
  payout: number;
}

function orderKey(orderId: string, merchantId: string) {
  return `${orderId}:${merchantId}`;
}

export async function listMerchantOrders(merchantId: string): Promise<MerchantOrderLine[]> {
  const page = await mockOrdersRepository.list({ page: 1, pageSize: 1000 });
  return page.items.flatMap((order) => {
    if (order.status === "cancelled") return [];
    const items = order.items.filter((item) => item.merchantId === merchantId);
    if (!items.length) return [];
    const saved = getStore().fulfilments[orderKey(order.id, merchantId)];
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const status = saved?.status ?? (order.status === "delivered" || order.status === "returned" ? order.status : order.status === "shipped" ? "shipped" : order.status === "processing" || order.status === "confirmed" ? "accepted" : "placed");
    const refunded = status === "returned";
    const commission = refunded ? 0 : Math.round(subtotal * COMMERCE.defaultCommissionRate / 100);
    return [{ order, items, status, courier: saved?.courier, awb: saved?.awb, subtotal, commission, payout: refunded ? 0 : subtotal - commission }];
  }).sort((a, b) => b.order.placedAt.localeCompare(a.order.placedAt));
}

export function updateMerchantFulfilment(merchantId: string, orderId: string, status: MerchantFulfilmentStatus, courier?: string, awb?: string): MerchantFulfilment {
  const fulfillment: MerchantFulfilment = { status, courier, awb, updatedAt: new Date().toISOString() };
  getStore().fulfilments[orderKey(orderId, merchantId)] = fulfillment;
  const order = orders.find((item) => item.id === orderId);
  const item = order?.items.find((line) => line.merchantId === merchantId);
  if (item) addMerchantNotification(merchantId, `Order ${order?.orderNumber} updated`, `${item.name}: ${status.replaceAll("_", " ")}.`);
  return fulfillment;
}

export function addMerchantNotification(merchantId: string, title: string, description: string): void {
  getStore().notifications.unshift({ id: crypto.randomUUID(), merchantId, title, description, createdAt: new Date().toISOString(), read: false });
}

export function listMerchantNotifications(merchantId: string): MerchantNotification[] {
  return getStore().notifications.filter((notification) => notification.merchantId === merchantId);
}

export function markMerchantNotificationsRead(merchantId: string): void {
  for (const notification of getStore().notifications) if (notification.merchantId === merchantId) notification.read = true;
}
