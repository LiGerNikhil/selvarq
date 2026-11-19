import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(20).max(2000),
});

/** DEMO ONLY: validates and acknowledges a message without sending or storing it. */
export async function POST(request: NextRequest) {
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Request must be valid JSON." }, { status: 400 }); }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Please check the message details." }, { status: 400 });
  return NextResponse.json({ ok: true });
}
