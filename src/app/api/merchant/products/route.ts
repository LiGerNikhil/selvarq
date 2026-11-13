import { NextResponse, type NextRequest } from "next/server";
import { getApprovedMerchantIdentity } from "@/lib/merchant-access";
import { getMerchantCatalogProducts, saveMerchantProduct, deleteMerchantProduct } from "@/lib/demo-merchant-store";
import { merchantProductSchema } from "@/lib/merchant-schemas";

export async function GET() {
  const identity = await getApprovedMerchantIdentity();
  if (!identity) return NextResponse.json({ error: "Approved seller access is required." }, { status: 403 });
  return NextResponse.json({ products: getMerchantCatalogProducts(identity.merchantId) });
}

export async function POST(request: NextRequest) {
  const identity = await getApprovedMerchantIdentity();
  if (!identity) return NextResponse.json({ error: "Approved seller access is required." }, { status: 403 });
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Request must be valid JSON." }, { status: 400 }); }
  const parsed = merchantProductSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Please correct the product details.", issues: parsed.error.flatten() }, { status: 400 });
  try {
    return NextResponse.json({ product: saveMerchantProduct(identity.merchantId, parsed.data) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save product.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}

export async function DELETE(request: NextRequest) {
  const identity = await getApprovedMerchantIdentity();
  if (!identity) return NextResponse.json({ error: "Approved seller access is required." }, { status: 403 });
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Request must be valid JSON." }, { status: 400 }); }
  const ids = (raw as { ids?: unknown })?.ids;
  if (!Array.isArray(ids) || !ids.length || ids.some((id) => typeof id !== "string")) {
    return NextResponse.json({ error: "Select one or more products." }, { status: 400 });
  }
  const owned = new Set(getMerchantCatalogProducts(identity.merchantId).map((product) => product.id));
  if (ids.some((id) => !owned.has(id))) return NextResponse.json({ error: "One or more selected products could not be found." }, { status: 404 });
  ids.forEach((id) => deleteMerchantProduct(identity.merchantId, id));
  return NextResponse.json({ ok: true, count: ids.length });
}

export async function PATCH(request: NextRequest) {
  const identity = await getApprovedMerchantIdentity();
  if (!identity) return NextResponse.json({ error: "Approved seller access is required." }, { status: 403 });
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Request must be valid JSON." }, { status: 400 }); }
  const body = raw as { ids?: unknown; status?: unknown };
  if (!Array.isArray(body.ids) || !body.ids.length || body.ids.some((id) => typeof id !== "string") || (body.status !== "active" && body.status !== "draft")) {
    return NextResponse.json({ error: "Select products and a valid publish status." }, { status: 400 });
  }
  const owned = new Map(getMerchantCatalogProducts(identity.merchantId).map((product) => [product.id, product]));
  if (body.ids.some((id) => !owned.has(id))) return NextResponse.json({ error: "One or more selected products could not be found." }, { status: 404 });
  for (const id of body.ids as string[]) {
    const product = owned.get(id);
    if (product) saveMerchantProduct(identity.merchantId, { ...product, status: body.status });
  }
  return NextResponse.json({ ok: true });
}
