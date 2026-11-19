import { NextResponse, type NextRequest } from "next/server";
import { getAdminIdentity } from "@/lib/admin-access";
import { adminProductSchema } from "@/lib/admin-schemas";
import { deleteAdminProduct, getAdminProducts, saveAdminProduct, updateAdminProductStatus } from "@/lib/admin-store";

export async function GET() {
  const identity = await getAdminIdentity();
  if (!identity) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  return NextResponse.json({ products: getAdminProducts() });
}

export async function POST(request: NextRequest) {
  const identity = await getAdminIdentity();
  if (!identity) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Request must be valid JSON." }, { status: 400 }); }
  const parsed = adminProductSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Please correct the product details.", issues: parsed.error.flatten() }, { status: 400 });
  try {
    return NextResponse.json({ product: saveAdminProduct(parsed.data) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save product." }, { status: 409 });
  }
}

export async function PATCH(request: NextRequest) {
  const identity = await getAdminIdentity();
  if (!identity) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Request must be valid JSON." }, { status: 400 }); }
  const body = raw as { ids?: unknown; status?: unknown };
  if (!Array.isArray(body.ids) || !body.ids.length || body.ids.some((id) => typeof id !== "string") || (body.status !== "active" && body.status !== "draft")) {
    return NextResponse.json({ error: "Select products and a valid publish status." }, { status: 400 });
  }
  const existing = new Set(getAdminProducts().map((product) => product.id));
  if (body.ids.some((id) => !existing.has(id))) return NextResponse.json({ error: "One or more products could not be found." }, { status: 404 });
  (body.ids as string[]).forEach((id) => updateAdminProductStatus(id, body.status as "active" | "draft"));
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const identity = await getAdminIdentity();
  if (!identity) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Request must be valid JSON." }, { status: 400 }); }
  const ids = (raw as { ids?: unknown })?.ids;
  if (!Array.isArray(ids) || !ids.length || ids.some((id) => typeof id !== "string")) return NextResponse.json({ error: "Select one or more products." }, { status: 400 });
  const deleted = ids.filter((id) => deleteAdminProduct(id)).length;
  return NextResponse.json({ ok: true, count: deleted });
}
