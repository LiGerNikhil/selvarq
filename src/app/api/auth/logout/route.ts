import { NextResponse } from "next/server";
import { clearDemoSession } from "@/lib/auth/demo-session";

export async function POST() {
  await clearDemoSession();
  return NextResponse.json({ next: "/login" });
}
