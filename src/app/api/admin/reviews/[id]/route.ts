import { NextResponse, type NextRequest } from "next/server";
import { getAdminIdentity } from "@/lib/admin-access";
import { adminReviewPatchSchema } from "@/lib/admin-schemas";
import { updateAdminReviewStatus } from "@/lib/admin-store";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const identity = await getAdminIdentity();
  if (!identity) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  const { id } = await params;
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Request must be valid JSON." }, { status: 400 }); }
  const parsed = adminReviewPatchSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Choose a review status." }, { status: 400 });
  updateAdminReviewStatus(id, parsed.data.status);
  return NextResponse.json({ ok: true });
}
