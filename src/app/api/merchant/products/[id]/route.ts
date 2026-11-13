import { NextResponse, type NextRequest } from "next/server";
import { getApprovedMerchantIdentity } from "@/lib/merchant-access";
import { saveMerchantProduct, getMerchantCatalogProducts } from "@/lib/demo-merchant-store";
import { merchantProductSchema } from "@/lib/merchant-schemas";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const identity = await getApprovedMerchantIdentity();
  if (!identity) return NextResponse.json({ error: "Approved seller access is required." }, { status: 403 });
  const { id } = await params;
  if (!getMerchantCatalogProducts(identity.merchantId).some((product) => product.id === id)) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Request must be valid JSON." }, { status: 400 }); }
  const parsed = merchantProductSchema.safeParse({ ...(raw as object), id });
  if (!parsed.success) return NextResponse.json({ error: "Please correct the product details.", issues: parsed.error.flatten() }, { status: 400 });
  try {
    return NextResponse.json({ product: saveMerchantProduct(identity.merchantId, parsed.data) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update product.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
