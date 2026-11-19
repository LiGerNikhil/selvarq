import { NextResponse, type NextRequest } from "next/server";
import { createDemoMerchantAccount } from "@/lib/demo-account-store";
import { setDemoSession } from "@/lib/auth/demo-session";
import { saveMerchantApplication, getMerchantApplicationByEmail } from "@/lib/demo-merchant-store";
import { registerAdminMerchantApplication } from "@/lib/admin-store";
import { merchantApplicationSchema } from "@/lib/merchant-schemas";

export async function POST(request: NextRequest) {
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Request must be valid JSON." }, { status: 400 }); }
  const parsed = merchantApplicationSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Please correct the application details.", issues: parsed.error.flatten() }, { status: 400 });
  if (getMerchantApplicationByEmail(parsed.data.email)) return NextResponse.json({ error: "An application already exists for that email." }, { status: 409 });
  const merchantId = `seller-${crypto.randomUUID()}`;
  try {
    const account = createDemoMerchantAccount({
      name: parsed.data.ownerName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      password: parsed.data.password,
      merchantId,
    });
    const application = parsed.data;
    saveMerchantApplication({
      id: crypto.randomUUID(),
      ownerUserId: account.id,
      merchantId,
      ownerName: application.ownerName,
      email: application.email.toLowerCase(),
      phone: application.phone,
      businessName: application.businessName,
      displayName: application.displayName,
      city: application.city,
      bio: application.bio,
      logoId: application.logoId || `placeholder:merchant-logo-${merchantId}`,
      gstDeclaration: application.gstDeclaration,
      ...(application.gstin ? { gstin: application.gstin } : {}),
      pan: application.pan,
      bank: application.bank,
      pickupAddress: application.pickupAddress,
      documents: application.documents,
      termsAccepted: application.termsAccepted,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    registerAdminMerchantApplication({
      id: crypto.randomUUID(),
      ownerUserId: account.id,
      merchantId,
      ownerName: application.ownerName,
      email: application.email.toLowerCase(),
      phone: application.phone,
      businessName: application.businessName,
      displayName: application.displayName,
      city: application.city,
      bio: application.bio,
      logoId: application.logoId || `placeholder:merchant-logo-${merchantId}`,
      gstDeclaration: application.gstDeclaration,
      ...(application.gstin ? { gstin: application.gstin } : {}),
      pan: application.pan,
      bank: application.bank,
      pickupAddress: application.pickupAddress,
      documents: application.documents,
      createdAt: new Date().toISOString(),
    });
    await setDemoSession(account.id);
    return NextResponse.json({ next: "/merchant/pending" }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not submit the seller application.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
