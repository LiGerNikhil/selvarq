import { markDirty } from "@/lib/db/persistence";
import { type EntityInput, type EntityRecord } from "@/lib/db/types";

export type OrderRequestType = "cancel" | "return" | "exchange";

export interface DemoOrderRequest {
  id: string;
  userId: string;
  orderId: string;
  type: OrderRequestType;
  reason: string;
  status: "received";
  createdAt: string;
}

const globalRequests = globalThis as typeof globalThis & { __selvarqOrderRequests?: DemoOrderRequest[] };

function requests(): DemoOrderRequest[] {
  return (globalRequests.__selvarqOrderRequests ??= []);
}

function persistRequests(): void {
  markDirty("orderRequests", orderRequestDocuments);
}

/** Every order request as a MongoDB record. */
export function orderRequestDocuments(): EntityInput[] {
  return requests().map((request, index) => ({ kind: "requests", entityId: request.id, position: index, data: request }));
}

/** Replaces the working request list with the persisted one, in place. */
export function applyOrderRequestDocuments(records: EntityRecord[]): void {
  const list = requests();
  list.splice(0, list.length, ...records.map((record) => record.data as DemoOrderRequest));
}

export function createDemoOrderRequest(input: Omit<DemoOrderRequest, "id" | "status" | "createdAt">): DemoOrderRequest {
  const request: DemoOrderRequest = { ...input, id: crypto.randomUUID(), status: "received", createdAt: new Date().toISOString() };
  requests().unshift(request);
  persistRequests();
  return request;
}

export function getDemoOrderRequests(userId: string, orderId: string): DemoOrderRequest[] {
  return requests().filter((request) => request.userId === userId && request.orderId === orderId);
}
