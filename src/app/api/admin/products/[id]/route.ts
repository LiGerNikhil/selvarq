import { NextResponse, type NextRequest } from "next/server";
import { getAdminIdentity } from "@/lib/admin-access";
import { adminProductSchema } from "@/lib/admin-schemas";
import { deleteAdminProduct, getAdminProduct, saveAdminProduct, updateAdminProductStatus } from "@/lib/admin-store";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const identity = await getAdminIdentity();
  if (!identity) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  const { id } = await params;
  const product = getAdminProduct(id);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Request must be valid JSON." }, { status: 400 }); }

  const body = raw as { status?: unknown };
  if (Object.keys(body).length === 1 && (body.status === "active" || body.status === "draft")) {
    return NextResponse.json({ product: updateAdminProductStatus(id, body.status) });
  }
  const parsed = adminProductSchema.safeParse({ ...(raw as object), id });
  if (!parsed.success) return NextResponse.json({ error: "Please correct the product details.", issues: parsed.error.flatten() }, { status: 400 });
  try {
    return NextResponse.json({ product: saveAdminProduct(parsed.data) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save product." }, { status: 409 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const identity = await getAdminIdentity();
  if (!identity) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  const { id } = await params;
  if (!deleteAdminProduct(id)) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
