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

export function createDemoOrderRequest(input: Omit<DemoOrderRequest, "id" | "status" | "createdAt">): DemoOrderRequest {
  const request: DemoOrderRequest = { ...input, id: crypto.randomUUID(), status: "received", createdAt: new Date().toISOString() };
  (globalRequests.__selvarqOrderRequests ??= []).unshift(request);
  return request;
}

export function getDemoOrderRequests(userId: string, orderId: string): DemoOrderRequest[] {
  return (globalRequests.__selvarqOrderRequests ?? []).filter((request) => request.userId === userId && request.orderId === orderId);
}
