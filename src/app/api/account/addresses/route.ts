import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth/demo-session";
import { addressSchema } from "@/lib/account-schemas";
import { getDemoAccountById, updateDemoAccount } from "@/lib/demo-account-store";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "customer") return NextResponse.json({ error: "Sign in as a customer to continue." }, { status: 401 });
  return NextResponse.json({ addresses: getDemoAccountById(session.userId)?.addresses ?? [] });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "customer") return NextResponse.json({ error: "Sign in as a customer to continue." }, { status: 401 });
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Request must be valid JSON." }, { status: 400 }); }
  const parsed = addressSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Please correct the address fields.", issues: parsed.error.flatten() }, { status: 400 });
  const account = getDemoAccountById(session.userId);
  if (!account) return NextResponse.json({ error: "Demo account not found." }, { status: 404 });
  const existingIndex = parsed.data.id ? account.addresses.findIndex((address) => address.id === parsed.data.id) : -1;
  if (existingIndex < 0 && account.addresses.length >= 10) return NextResponse.json({ error: "You can save up to 10 addresses." }, { status: 422 });
  const saved = { ...parsed.data, id: parsed.data.id ?? `address-${crypto.randomUUID()}`, country: "IN" as const };
  const addresses = account.addresses.map((address) => saved.isDefault ? { ...address, isDefault: false } : address);
  if (existingIndex >= 0) addresses[existingIndex] = saved;
  else addresses.push(saved);
  if (!addresses.some((address) => address.isDefault) && addresses[0]) addresses[0].isDefault = true;
  updateDemoAccount(session.userId, { addresses });
  return NextResponse.json({ address: saved }, { status: existingIndex >= 0 ? 200 : 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "customer") return NextResponse.json({ error: "Sign in as a customer to continue." }, { status: 401 });
  let body: { id?: string };
  try { body = await request.json() as { id?: string }; } catch { return NextResponse.json({ error: "Request must be valid JSON." }, { status: 400 }); }
  if (!body.id) return NextResponse.json({ error: "Address id is required." }, { status: 400 });
  const account = getDemoAccountById(session.userId);
  if (!account) return NextResponse.json({ error: "Demo account not found." }, { status: 404 });
  let addresses = account.addresses.filter((address) => address.id !== body.id);
  if (addresses.length === account.addresses.length) return NextResponse.json({ error: "Address not found." }, { status: 404 });
  if (!addresses.some((address) => address.isDefault) && addresses[0]) addresses = addresses.map((address, index) => ({ ...address, isDefault: index === 0 }));
  updateDemoAccount(session.userId, { addresses });
  return NextResponse.json({ ok: true });
}
