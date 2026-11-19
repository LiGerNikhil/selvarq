import { NextResponse, type NextRequest } from "next/server";
import { getAdminIdentity } from "@/lib/admin-access";
import { adminCouponSchema } from "@/lib/admin-schemas";
import { deleteAdminCoupon, saveAdminCoupon } from "@/lib/admin-store";

export async function POST(request: NextRequest) {
  const identity = await getAdminIdentity();
  if (!identity) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Request must be valid JSON." }, { status: 400 }); }
  const parsed = adminCouponSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Please check the coupon details.", issues: parsed.error.flatten() }, { status: 400 });
  return NextResponse.json({ coupon: saveAdminCoupon(parsed.data) });
}

export async function DELETE(request: NextRequest) {
  const identity = await getAdminIdentity();
  if (!identity) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Request must be valid JSON." }, { status: 400 }); }
  const id = (raw as { id?: unknown })?.id;
  if (typeof id !== "string") return NextResponse.json({ error: "Choose a coupon to delete." }, { status: 400 });
  if (!deleteAdminCoupon(id)) return NextResponse.json({ error: "Coupon not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
