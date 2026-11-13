import { NextResponse, type NextRequest } from "next/server";
import { forgotPasswordSchema } from "@/lib/account-schemas";
import { createDemoResetToken, findDemoAccount } from "@/lib/demo-account-store";

export async function POST(request: NextRequest) {
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Request must be valid JSON." }, { status: 400 }); }
  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Enter the email or mobile linked to your account.", issues: parsed.error.flatten() }, { status: 400 });
  const account = findDemoAccount(parsed.data.identifier);
  const resetUrl = account ? `/reset-password?token=${encodeURIComponent(createDemoResetToken(account.id))}` : undefined;
  return NextResponse.json({
    message: "If an account matches those details, you can reset its password.",
    ...(resetUrl ? { resetUrl } : {}),
  });
}
