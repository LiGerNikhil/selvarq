import { NextResponse, type NextRequest } from "next/server";
import { getApprovedMerchantIdentity } from "@/lib/merchant-access";
import { getMerchantProfile, updateMerchantProfile } from "@/lib/demo-merchant-store";
import { merchantProfileSchema } from "@/lib/merchant-schemas";

export async function GET() {
  const identity = await getApprovedMerchantIdentity();
  if (!identity) return NextResponse.json({ error: "Approved seller access is required." }, { status: 403 });
  return NextResponse.json({ profile: getMerchantProfile(identity.merchantId) });
}

export async function PUT(request: NextRequest) {
  const identity = await getApprovedMerchantIdentity();
  if (!identity) return NextResponse.json({ error: "Approved seller access is required." }, { status: 403 });
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Request must be valid JSON." }, { status: 400 }); }
  const parsed = merchantProfileSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Please correct your storefront details.", issues: parsed.error.flatten() }, { status: 400 });
  updateMerchantProfile(identity.merchantId, parsed.data);
  return NextResponse.json({ profile: getMerchantProfile(identity.merchantId) });
}
