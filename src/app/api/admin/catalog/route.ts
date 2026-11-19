import { NextResponse, type NextRequest } from "next/server";
import { getAdminIdentity } from "@/lib/admin-access";
import { adminCategorySchema, adminCollectionSchema } from "@/lib/admin-schemas";
import { deleteAdminCategory, deleteAdminCollection, getAdminCategories, getAdminCollections, saveAdminCategory, saveAdminCollection } from "@/lib/admin-store";

export async function GET() {
  const identity = await getAdminIdentity();
  if (!identity) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  return NextResponse.json({ categories: getAdminCategories(), collections: getAdminCollections() });
}

export async function POST(request: NextRequest) {
  const identity = await getAdminIdentity();
  if (!identity) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Request must be valid JSON." }, { status: 400 }); }
  const body = raw as { kind?: unknown; data?: unknown };
  if (body.kind === "category") {
    const parsed = adminCategorySchema.safeParse(body.data);
    if (!parsed.success) return NextResponse.json({ error: "Please check the category details.", issues: parsed.error.flatten() }, { status: 400 });
    return NextResponse.json({ category: saveAdminCategory(parsed.data) });
  }
  if (body.kind === "collection") {
    const parsed = adminCollectionSchema.safeParse(body.data);
    if (!parsed.success) return NextResponse.json({ error: "Please check the collection details.", issues: parsed.error.flatten() }, { status: 400 });
    return NextResponse.json({ collection: saveAdminCollection(parsed.data) });
  }
  return NextResponse.json({ error: "Choose a category or collection." }, { status: 400 });
}

export async function DELETE(request: NextRequest) {
  const identity = await getAdminIdentity();
  if (!identity) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Request must be valid JSON." }, { status: 400 }); }
  const body = raw as { kind?: unknown; id?: unknown };
  if (typeof body.id !== "string") return NextResponse.json({ error: "Choose a record to delete." }, { status: 400 });
  if (body.kind === "category") return NextResponse.json({ ok: deleteAdminCategory(body.id) });
  if (body.kind === "collection") return NextResponse.json({ ok: deleteAdminCollection(body.id) });
  return NextResponse.json({ error: "Choose a category or collection." }, { status: 400 });
}
