import { NextResponse, type NextRequest } from "next/server";
import { getAdminIdentity } from "@/lib/admin-access";
import { changePasswordSchema } from "@/lib/account-schemas";
import { changeDemoPassword } from "@/lib/demo-account-store";

export async function POST(request: NextRequest) {
  const identity = await getAdminIdentity();
  if (!identity) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Request must be valid JSON." }, { status: 400 }); }
  const parsed = changePasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the password fields.", issues: parsed.error.flatten() }, { status: 400 });
  }
  const changed = changeDemoPassword(identity.account.id, parsed.data.currentPassword, parsed.data.newPassword);
  if (!changed) return NextResponse.json({ error: "Your current password is not correct." }, { status: 401 });
  return NextResponse.json({ ok: true });
}
