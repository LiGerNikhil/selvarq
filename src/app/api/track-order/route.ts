import { NextResponse, type NextRequest } from "next/server";
import { ordersRepository } from "@/lib/repo";

/** DEMO ONLY: reveals limited tracking detail when the order number and checkout email match. */
export async function POST(request: NextRequest) {
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Request must be valid JSON." }, { status: 400 }); }
  const { orderNumber, email } = raw as { orderNumber?: unknown; email?: unknown };
  if (typeof orderNumber !== "string" || typeof email !== "string" || !orderNumber.trim() || !email.includes("@")) {
    return NextResponse.json({ error: "Enter your order number and email address." }, { status: 400 });
  }
  const order = await ordersRepository.getByNumber(orderNumber.trim().toUpperCase());
  if (!order || (order.address?.email ?? "").toLowerCase() !== email.trim().toLowerCase()) {
    return NextResponse.json({ error: "No order matches those details. Check the number and email and try again." }, { status: 404 });
  }
  return NextResponse.json({
    orderNumber: order.orderNumber,
    placedAt: order.placedAt,
    status: order.status,
    trackingNumber: order.trackingNumber,
    items: order.items.map((item) => ({ name: item.name, quantity: item.quantity })),
    shipments: (order.merchantOrders ?? []).map((shipment) => ({
      merchantName: shipment.merchantName,
      status: shipment.status,
      trackingNumber: (shipment as { trackingNumber?: string }).trackingNumber,
    })),
  });
}
