import { NextResponse, type NextRequest } from "next/server";
import { getApprovedMerchantIdentity } from "@/lib/merchant-access";
import { listMerchantOrders, updateMerchantFulfilment } from "@/lib/demo-merchant-store";
import { merchantFulfilmentSchema } from "@/lib/merchant-schemas";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const identity = await getApprovedMerchantIdentity();
  if (!identity) return NextResponse.json({ error: "Approved seller access is required." }, { status: 403 });
  const { id } = await params;
  const orders = await listMerchantOrders(identity.merchantId);
  const order = orders.find((item) => item.order.id === id);
  if (!order) return NextResponse.json({ error: "Order not found for this store." }, { status: 404 });
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Request must be valid JSON." }, { status: 400 }); }
  const parsed = merchantFulfilmentSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Please enter valid fulfilment details.", issues: parsed.error.flatten() }, { status: 400 });
  const allowedNext = {
    placed: ["accepted"],
    accepted: ["packed", "return_requested"],
    packed: ["shipped"],
    shipped: ["delivered", "return_requested"],
    delivered: ["return_requested"],
    return_requested: ["returned"],
    returned: [],
  } as const;
  if (!allowedNext[order.status].includes(parsed.data.status as never)) {
    return NextResponse.json({ error: `Cannot move this fulfilment from ${order.status.replaceAll("_", " ")} to ${parsed.data.status.replaceAll("_", " ")}.` }, { status: 409 });
  }
  const fulfillment = updateMerchantFulfilment(identity.merchantId, id, parsed.data.status, parsed.data.courier, parsed.data.awb);
  return NextResponse.json({ fulfillment });
}
