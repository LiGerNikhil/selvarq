import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth/demo-session";
import { orderRequestSchema } from "@/lib/account-schemas";
import { createDemoOrderRequest } from "@/lib/demo-order-requests";
import { ordersRepository } from "@/lib/repo";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "customer") return NextResponse.json({ error: "Sign in as a customer to continue." }, { status: 401 });
  const { id } = await params;
  const order = await ordersRepository.getById(id);
  if (!order || order.userId !== session.userId) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Request must be valid JSON." }, { status: 400 }); }
  const parsed = orderRequestSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Please select a request type and reason.", issues: parsed.error.flatten() }, { status: 400 });
  if (parsed.data.type === "cancel" && ["shipped", "delivered", "cancelled", "returned"].includes(order.status)) {
    return NextResponse.json({ error: "This order can no longer be cancelled. Request a return or exchange if eligible." }, { status: 422 });
  }
  if (parsed.data.type !== "cancel" && order.status !== "delivered") {
    return NextResponse.json({ error: "Returns and exchanges are available after delivery." }, { status: 422 });
  }
  const orderRequest = createDemoOrderRequest({ userId: session.userId, orderId: id, ...parsed.data });
  return NextResponse.json({ ok: true, request: orderRequest }, { status: 201 });
}
