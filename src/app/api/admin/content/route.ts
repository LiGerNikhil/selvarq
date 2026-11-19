import { NextResponse, type NextRequest } from "next/server";
import { getAdminIdentity } from "@/lib/admin-access";
import { adminAnnouncementSchema, adminBannerSchema, adminStorySchema } from "@/lib/admin-schemas";
import { deleteAdminBanner, deleteAdminStory, getAdminAnnouncement, getAdminBanners, getAdminStories, saveAdminBanner, saveAdminStory, updateAdminAnnouncement } from "@/lib/admin-store";

export async function GET() {
  const identity = await getAdminIdentity();
  if (!identity) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  return NextResponse.json({ banners: getAdminBanners(), stories: getAdminStories(), announcement: getAdminAnnouncement() });
}

export async function POST(request: NextRequest) {
  const identity = await getAdminIdentity();
  if (!identity) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Request must be valid JSON." }, { status: 400 }); }
  const body = raw as { kind?: unknown; data?: unknown };
  if (body.kind === "banner") {
    const parsed = adminBannerSchema.safeParse(body.data);
    if (!parsed.success) return NextResponse.json({ error: "Please check the banner details.", issues: parsed.error.flatten() }, { status: 400 });
    return NextResponse.json({ banner: saveAdminBanner(parsed.data) });
  }
  if (body.kind === "story") {
    const parsed = adminStorySchema.safeParse(body.data);
    if (!parsed.success) return NextResponse.json({ error: "Please check the story details.", issues: parsed.error.flatten() }, { status: 400 });
    return NextResponse.json({ story: saveAdminStory(parsed.data) });
  }
  if (body.kind === "announcement") {
    const parsed = adminAnnouncementSchema.safeParse(body.data);
    if (!parsed.success) return NextResponse.json({ error: "Please check the announcement details.", issues: parsed.error.flatten() }, { status: 400 });
    updateAdminAnnouncement({
      active: parsed.data.active,
      offers: parsed.data.offers.map((offer) => ({ id: offer.id ?? crypto.randomUUID(), text: offer.text, href: offer.href })),
    });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Choose banners, stories or the announcement bar." }, { status: 400 });
}

export async function DELETE(request: NextRequest) {
  const identity = await getAdminIdentity();
  if (!identity) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Request must be valid JSON." }, { status: 400 }); }
  const body = raw as { kind?: unknown; id?: unknown };
  if (typeof body.id !== "string") return NextResponse.json({ error: "Choose a record to delete." }, { status: 400 });
  if (body.kind === "banner") return NextResponse.json({ ok: deleteAdminBanner(body.id) });
  if (body.kind === "story") return NextResponse.json({ ok: deleteAdminStory(body.id) });
  return NextResponse.json({ error: "Choose a banner or story." }, { status: 400 });
}
