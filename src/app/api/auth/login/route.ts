import { NextResponse, type NextRequest } from "next/server";
import { loginSchema } from "@/lib/account-schemas";
import { findDemoAccount } from "@/lib/demo-account-store";
import { setDemoSession } from "@/lib/auth/demo-session";

export async function POST(request: NextRequest) {
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Request must be valid JSON." }, { status: 400 }); }
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Please check your sign-in details.", issues: parsed.error.flatten() }, { status: 400 });
  const { identifier, method, password, otp } = parsed.data;
  const account = findDemoAccount(identifier);
  const authenticated = account && (method === "password" ? account.password === password : otp === "123456");
  if (!account || !authenticated) return NextResponse.json({ error: "Those sign-in details were not recognized." }, { status: 401 });
  await setDemoSession(account.id);
  const next = account.role === "merchant"
    ? "/merchant/dashboard"
    : account.role === "customer" && !account.preferences.onboardingComplete
      ? "/onboarding"
      : account.role === "admin"
        ? "/"
        : "/account";
  return NextResponse.json({ next });
}
