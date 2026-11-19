import { NextResponse, type NextRequest } from "next/server";
import { getAdminIdentity } from "@/lib/admin-access";
import { adminMerchantPatchSchema } from "@/lib/admin-schemas";
import { getAdminMerchant, updateAdminMerchant, verifyAdminMerchantDocument } from "@/lib/admin-store";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const identity = await getAdminIdentity();
  if (!identity) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  const { id } = await params;
  if (!getAdminMerchant(id)) return NextResponse.json({ error: "Merchant not found." }, { status: 404 });
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Request must be valid JSON." }, { status: 400 }); }
  const parsed = adminMerchantPatchSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Please check the merchant details.", issues: parsed.error.flatten() }, { status: 400 });

  if (parsed.data.documentId) {
    if (typeof parsed.data.documentVerified !== "boolean") return NextResponse.json({ error: "Choose whether the document is verified." }, { status: 400 });
    const document = verifyAdminMerchantDocument(id, parsed.data.documentId, parsed.data.documentVerified);
    if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }
  const merchant = updateAdminMerchant(id, {
    ...(parsed.data.status ? { status: parsed.data.status } : {}),
    ...(parsed.data.commissionRate !== undefined ? { commissionRate: parsed.data.commissionRate } : {}),
    ...(parsed.data.rejectionReason !== undefined ? { rejectionReason: parsed.data.rejectionReason } : {}),
  });
  return NextResponse.json({ merchant });
}
