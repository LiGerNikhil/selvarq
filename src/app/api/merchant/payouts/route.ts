import { NextResponse } from "next/server";
import { getApprovedMerchantIdentity } from "@/lib/merchant-access";
import { listMerchantOrders } from "@/lib/demo-merchant-store";
import { formatDate, formatINR } from "@/lib/format";
import { COMMERCE } from "@/lib/config";

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const identity = await getApprovedMerchantIdentity();
  if (!identity) return NextResponse.json({ error: "Approved seller access is required." }, { status: 403 });
  const rows = await listMerchantOrders(identity.merchantId);
  if (new URL(request.url).searchParams.get("format") !== "csv") return NextResponse.json({ error: "Request a CSV export with format=csv." }, { status: 400 });
  const header = ["Order", "Date", "Item subtotal (INR)", `Commission ${COMMERCE.defaultCommissionRate}% (INR)`, "Estimated payout (INR)", "Fulfilment status"];
  const data = rows.map((row) => [row.order.orderNumber, formatDate(row.order.placedAt), formatINR(row.subtotal), formatINR(row.commission), formatINR(row.payout), row.status]);
  const body = [header, ...data].map((line) => line.map((value) => csvCell(value)).join(",")).join("\r\n");
  return new NextResponse(`\uFEFF${body}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="selvarq-payout-${identity.merchantId}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
