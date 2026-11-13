import { orders } from "@/data";
import type { Order, OrderStatus } from "@/data";
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
const demoOrders = orderStore.__selvarqDemoOrders ?? (orderStore.__selvarqDemoOrders = [...orders]);

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
    return order;
  },
  async update(id, patch) {
    const index = demoOrders.findIndex((order) => order.id === id);
    if (index < 0) return undefined;
    demoOrders[index] = { ...demoOrders[index], ...patch };
    return demoOrders[index];
  },
};
