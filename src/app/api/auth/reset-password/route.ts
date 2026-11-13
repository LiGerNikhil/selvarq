import { NextResponse, type NextRequest } from "next/server";
import { resetPasswordSchema } from "@/lib/account-schemas";
import { consumeDemoResetToken, setDemoPassword } from "@/lib/demo-account-store";

export async function POST(request: NextRequest) {
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Request must be valid JSON." }, { status: 400 }); }
  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Please correct the new password.", issues: parsed.error.flatten() }, { status: 400 });
  const userId = consumeDemoResetToken(parsed.data.token);
  if (!userId || !setDemoPassword(userId, parsed.data.password)) {
    return NextResponse.json({ error: "This demo reset link has expired or was already used. Request a new one." }, { status: 400 });
  }
  return NextResponse.json({ message: "Your demo password was reset." });
}
