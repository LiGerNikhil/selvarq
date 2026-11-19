import { orders } from "@/data";
import type { Order, OrderStatus } from "@/data";
import { demoDataEnabled } from "@/lib/demo-data";
import { markDirty } from "@/lib/db/persistence";
import { type EntityInput, type EntityRecord } from "@/lib/db/types";
import { paginate, type Page, type PageOptions } from "./types";

export interface OrderQuery extends PageOptions {
  userId?: string;
  status?: OrderStatus;
}

export interface OrdersRepository {
  getById(id: string): Promise<Order | undefined>;
  getByNumber(orderNumber: string): Promise<Order | undefined>;
  list(query?: OrderQuery): Promise<Page<Order>>;
  create(order: Order): Promise<Order>;
  update(id: string, patch: Partial<Order>): Promise<Order | undefined>;
}

const orderStore = globalThis as typeof globalThis & { __selvarqDemoOrders?: Order[] };
const demoOrders = orderStore.__selvarqDemoOrders ?? (orderStore.__selvarqDemoOrders = demoDataEnabled() ? [...orders] : []);

function persistOrders(): void {
  markDirty("orders", orderDocuments);
}

/** Every order as a MongoDB record. */
export function orderDocuments(): EntityInput[] {
  return demoOrders.map((order, index) => ({ kind: "orders", entityId: order.id, position: index, data: order }));
}

/** Replaces the working order list with the persisted one, in place. */
export function applyOrderDocuments(records: EntityRecord[]): void {
  const loaded = records.map((record) => record.data as Order);
  demoOrders.splice(0, demoOrders.length, ...loaded);
}

/** Synchronous lookup for in-process hooks that cannot await (e.g. notifications). */
export function findOrderById(id: string): Order | undefined {
  return demoOrders.find((order) => order.id === id);
}

export const mockOrdersRepository: OrdersRepository = {
  async getById(id) { return demoOrders.find((order) => order.id === id); },
  async getByNumber(orderNumber) { return demoOrders.find((order) => order.orderNumber === orderNumber); },
  async list(query = {}) {
    return paginate(demoOrders.filter((order) =>
      (!query.userId || order.userId === query.userId) && (!query.status || order.status === query.status),
    ), query);
  },
  async create(order) {
    if (demoOrders.some((existing) => existing.id === order.id || existing.orderNumber === order.orderNumber)) {
      throw new Error(`Duplicate demo order identifier "${order.id}".`);
    }
    demoOrders.unshift(order);
    persistOrders();
    return order;
  },
  async update(id, patch) {
    const index = demoOrders.findIndex((order) => order.id === id);
    if (index < 0) return undefined;
    demoOrders[index] = { ...demoOrders[index], ...patch };
    persistOrders();
    return demoOrders[index];
  },
};
