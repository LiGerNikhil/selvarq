import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth/demo-session";
import { profileSchema, preferencesSchema, notificationSchema } from "@/lib/account-schemas";
import { getDemoAccountById, updateDemoAccount } from "@/lib/demo-account-store";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "customer") return NextResponse.json({ error: "Sign in as a customer to continue." }, { status: 401 });
  const account = getDemoAccountById(session.userId);
  if (!account) return NextResponse.json({ error: "Demo account not found." }, { status: 404 });
  const safeAccount = {
    id: account.id,
    name: account.name,
    email: account.email,
    phone: account.phone,
    role: account.role,
    joinedAt: account.joinedAt,
    addresses: account.addresses,
    preferences: account.preferences,
    notifications: account.notifications,
  };
  return NextResponse.json(safeAccount);
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "customer") return NextResponse.json({ error: "Sign in as a customer to continue." }, { status: 401 });
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Request must be valid JSON." }, { status: 400 }); }
  if (!raw || typeof raw !== "object" || !("section" in raw) || !("values" in raw)) {
    return NextResponse.json({ error: "Provide an account section and values." }, { status: 400 });
  }
  const { section, values } = raw as { section?: unknown; values?: unknown };
  if (section !== "profile" && section !== "preferences" && section !== "notifications") {
    return NextResponse.json({ error: "Unknown account section." }, { status: 400 });
  }
  try {
    let updated;
    if (section === "profile") {
      const parsed = profileSchema.safeParse(values);
      if (!parsed.success) return NextResponse.json({ error: "Please correct the highlighted fields.", issues: parsed.error.flatten() }, { status: 400 });
      updated = updateDemoAccount(session.userId, parsed.data);
    } else if (section === "preferences") {
      const parsed = preferencesSchema.safeParse(values);
      if (!parsed.success) return NextResponse.json({ error: "Please correct the highlighted fields.", issues: parsed.error.flatten() }, { status: 400 });
      updated = updateDemoAccount(session.userId, { preferences: parsed.data });
    } else {
      const parsed = notificationSchema.safeParse(values);
      if (!parsed.success) return NextResponse.json({ error: "Please correct the highlighted fields.", issues: parsed.error.flatten() }, { status: 400 });
      updated = updateDemoAccount(session.userId, { notifications: parsed.data });
    }
    if (!updated) return NextResponse.json({ error: "Demo account not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update your account." }, { status: 409 });
  }
}
