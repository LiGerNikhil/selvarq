import { NextResponse, type NextRequest } from "next/server";
import { getAdminIdentity } from "@/lib/admin-access";
import { adminSettingsSchema } from "@/lib/admin-schemas";
import { getAdminSettings, updateAdminSettings } from "@/lib/admin-store";

export async function GET() {
  const identity = await getAdminIdentity();
  if (!identity) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  return NextResponse.json({ settings: getAdminSettings() });
}

export async function PUT(request: NextRequest) {
  const identity = await getAdminIdentity();
  if (!identity) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Request must be valid JSON." }, { status: 400 }); }
  const parsed = adminSettingsSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Please check the commerce settings.", issues: parsed.error.flatten() }, { status: 400 });
  updateAdminSettings(parsed.data);
  return NextResponse.json({ settings: getAdminSettings() });
}
