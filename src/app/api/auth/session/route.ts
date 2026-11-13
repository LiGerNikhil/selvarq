import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/demo-session";
import { getDemoAccountById } from "@/lib/demo-account-store";

export async function GET() {
  const session = await getSession();
  const account = session ? getDemoAccountById(session.userId) : undefined;
  return NextResponse.json({
    account: account ? { id: account.id, name: account.name, role: account.role } : null,
  });
}
