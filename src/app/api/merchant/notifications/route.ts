import { NextResponse } from "next/server";
import { getApprovedMerchantIdentity } from "@/lib/merchant-access";
import { listMerchantNotifications, markMerchantNotificationsRead } from "@/lib/demo-merchant-store";

export async function GET() {
  const identity = await getApprovedMerchantIdentity();
  if (!identity) return NextResponse.json({ error: "Approved seller access is required." }, { status: 403 });
  return NextResponse.json({ notifications: listMerchantNotifications(identity.merchantId) });
}

export async function PATCH() {
  const identity = await getApprovedMerchantIdentity();
  if (!identity) return NextResponse.json({ error: "Approved seller access is required." }, { status: 403 });
  markMerchantNotificationsRead(identity.merchantId);
  return NextResponse.json({ ok: true });
}
