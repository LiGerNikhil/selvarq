import { NextResponse, type NextRequest } from "next/server";
import { registerSchema } from "@/lib/account-schemas";
import { createDemoAccount } from "@/lib/demo-account-store";
import { setDemoSession } from "@/lib/auth/demo-session";

export async function POST(request: NextRequest) {
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Request must be valid JSON." }, { status: 400 }); }
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Please correct the highlighted fields.", issues: parsed.error.flatten() }, { status: 400 });
  try {
    const account = createDemoAccount(parsed.data);
    await setDemoSession(account.id);
    return NextResponse.json({ next: "/onboarding" }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create the demo account.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
