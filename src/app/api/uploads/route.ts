import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminIdentity } from "@/lib/admin-access";
import { uploadImage } from "@/lib/cloudinary";
import { isCloudinaryConfigured } from "@/lib/env";
import { getApprovedMerchantIdentity } from "@/lib/merchant-access";
import {
  GUEST_UPLOAD_FOLDER,
  MERCHANT_UPLOAD_FOLDERS,
  UPLOAD_FOLDER_KEYS,
  type UploadFolderKey,
} from "@/lib/upload-folders";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;
const GUEST_MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);

/** How long a pasted link may take to answer, and how many redirects we follow. */
const IMPORT_TIMEOUT_MS = 15_000;
const IMPORT_REDIRECTS = 3;

/** Small in-process guard against accidental upload loops. */
const buckets = new Map<string, { count: number; resetAt: number }>();

function rateLimited(key: string, limit: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  bucket.count += 1;
  return bucket.count > limit;
}

function clientKey(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}

function isUploadFolder(value: unknown): value is UploadFolderKey {
  return typeof value === "string" && UPLOAD_FOLDER_KEYS.includes(value as UploadFolderKey);
}

/** A user-facing problem while importing a pasted image link. */
class UrlImportError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "UrlImportError";
    this.status = status;
  }
}

function isPrivateAddress(address: string): boolean {
  const version = isIP(address);
  if (version === 4) {
    const [a, b] = address.split(".").map(Number);
    if (a === undefined || b === undefined) return true;
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224
    );
  }
  if (version === 6) {
    const normalized = address.toLowerCase();
    if (normalized === "::" || normalized === "::1") return true;
    // Unique local (fc00::/7), link local (fe80::/10) and multicast (ff00::/8).
    if (normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("ff")) return true;
    if (["fe8", "fe9", "fea", "feb"].some((prefix) => normalized.startsWith(prefix))) return true;

    // IPv4-mapped addresses: dotted (::ffff:127.0.0.1) or hex (::ffff:7f00:1).
    const mapped = normalized.match(/^::ffff:(.+)$/);
    if (mapped?.[1]) {
      const tail = mapped[1];
      if (tail.includes(".")) return isPrivateAddress(tail);
      const [high, low] = tail.split(":");
      const hi = Number.parseInt(high ?? "", 16);
      const lo = Number.parseInt(low ?? "", 16);
      if (Number.isFinite(hi) && Number.isFinite(lo)) {
        return isPrivateAddress(`${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`);
      }
      return true;
    }

    // Deprecated IPv4-compatible form (::127.0.0.1).
    if (normalized.startsWith("::") && normalized.includes(".")) {
      return isPrivateAddress(normalized.slice(2));
    }
    return false;
  }
  return true;
}

/**
 * Blocks localhost, private ranges and other internal hosts so a pasted link
 * cannot be used to probe the server's own network.
 */
async function assertPublicUrl(url: URL): Promise<void> {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new UrlImportError("Only http and https image links are supported.");
  }

  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (!host) throw new UrlImportError("That link is missing a host name.");
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".home.arpa")
  ) {
    throw new UrlImportError("That link points to a private address.");
  }
  if (isIP(host) && isPrivateAddress(host)) {
    throw new UrlImportError("That link points to a private address.");
  }

  let addresses: { address: string }[];
  try {
    addresses = await lookup(host, { all: true, verbatim: true });
  } catch {
    throw new UrlImportError("That image link could not be reached.", 502);
  }
  if (!addresses.length || addresses.some((entry) => isPrivateAddress(entry.address))) {
    throw new UrlImportError("That link points to a private address.");
  }
}

/** Recognises common image formats when a server sends no useful content type. */
function sniffImageType(data: Uint8Array): string | null {
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return "image/jpeg";
  if (
    data.length >= 8 &&
    data[0] === 0x89 &&
    data[1] === 0x50 &&
    data[2] === 0x4e &&
    data[3] === 0x47 &&
    data[4] === 0x0d &&
    data[5] === 0x0a &&
    data[6] === 0x1a &&
    data[7] === 0x0a
  ) {
    return "image/png";
  }
  if (data.length >= 6) {
    const header = String.fromCharCode(...data.subarray(0, 6));
    if (header === "GIF87a" || header === "GIF89a") return "image/gif";
  }
  if (data.length >= 12) {
    const riff = String.fromCharCode(...data.subarray(0, 4));
    const webp = String.fromCharCode(...data.subarray(8, 12));
    if (riff === "RIFF" && webp === "WEBP") return "image/webp";
  }
  if (data.length >= 12 && String.fromCharCode(...data.subarray(4, 8)) === "ftyp") {
    const brand = String.fromCharCode(...data.subarray(8, 12));
    if (brand === "avif" || brand === "avis") return "image/avif";
  }
  return null;
}

function fileNameFromUrl(url: URL): string {
  const last = url.pathname.split("/").filter(Boolean).pop() ?? "";
  const base = decodeURIComponent(last).replace(/\.[a-z0-9]+$/i, "").replace(/[^a-z0-9_-]+/gi, "-").slice(0, 60);
  return base || `${url.hostname.replace(/[^a-z0-9.-]+/gi, "-")}-image`;
}

/** Streams the response into memory but stops as soon as the size limit is crossed. */
async function readLimited(response: Response, maxBytes: number): Promise<Uint8Array> {
  if (!response.body) throw new UrlImportError("That image link returned no data.", 502);
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => undefined);
        throw new UrlImportError(
          maxBytes === GUEST_MAX_BYTES ? "Application images must be 4 MB or smaller." : "Images must be 8 MB or smaller.",
          413,
        );
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const data = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    data.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return data;
}

/**
 * Downloads a pasted image link so it can be stored as a Cloudinary asset.
 * Following redirects manually lets every hop pass the private-address check.
 */
async function downloadImage(raw: string, maxBytes: number): Promise<{ data: Uint8Array; fileName: string }> {
  let current: URL;
  try {
    current = new URL(raw);
  } catch {
    throw new UrlImportError("That does not look like a valid image link.");
  }

  for (let hop = 0; hop <= IMPORT_REDIRECTS; hop += 1) {
    await assertPublicUrl(current);

    let response: Response;
    try {
      response = await fetch(current, {
        redirect: "manual",
        cache: "no-store",
        signal: AbortSignal.timeout(IMPORT_TIMEOUT_MS),
        headers: {
          accept: "image/avif,image/webp,image/png,image/jpeg,image/gif,image/*;q=0.8",
          "user-agent": "SELVARQ-image-import/1.0",
        },
      });
    } catch {
      throw new UrlImportError("That image link could not be reached.", 502);
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new UrlImportError("That image link redirects somewhere unreachable.", 502);
      current = new URL(location, current);
      continue;
    }
    if (!response.ok) {
      throw new UrlImportError(`That image link returned ${response.status}.`, 502);
    }

    const declared = Number(response.headers.get("content-length") ?? 0);
    if (Number.isFinite(declared) && declared > maxBytes) {
      throw new UrlImportError(
        maxBytes === GUEST_MAX_BYTES ? "Application images must be 4 MB or smaller." : "Images must be 8 MB or smaller.",
        413,
      );
    }

    const data = await readLimited(response, maxBytes);
    if (!data.byteLength) throw new UrlImportError("That image link returned an empty file.", 502);

    const headerType = (response.headers.get("content-type") ?? "").split(";")[0]?.trim().toLowerCase() ?? "";
    const type = ALLOWED_TYPES.has(headerType) ? headerType : sniffImageType(data);
    if (!type) {
      throw new UrlImportError("That link is not a JPG, PNG, WebP, AVIF or GIF image.", 415);
    }

    return { data, fileName: fileNameFromUrl(current) };
  }

  throw new UrlImportError("That image link redirects too many times.");
}

function folderError(folder: UploadFolderKey, guest: boolean, merchant: boolean): NextResponse | null {
  if (guest && folder !== GUEST_UPLOAD_FOLDER) {
    return NextResponse.json({ error: "Sign in to upload this image." }, { status: 403 });
  }
  if (merchant && !MERCHANT_UPLOAD_FOLDERS.includes(folder)) {
    return NextResponse.json({ error: "Your seller account cannot upload to this folder." }, { status: 403 });
  }
  return null;
}

/**
 * Accepts either a multipart image or JSON `{ url, folder }`, checks the
 * caller's role, and stores the result in Cloudinary. Pasted links are fetched
 * server-side so next/image only ever sees Cloudinary assets. The API secret
 * stays on the server; the browser never sees it.
 */
export async function POST(request: NextRequest) {
  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Image uploads are not configured yet. Add the Cloudinary cloud name to .env.local and restart the server." },
      { status: 503 },
    );
  }

  const admin = await getAdminIdentity();
  const merchant = admin ? null : await getApprovedMerchantIdentity();
  const guest = !admin && !merchant;

  const limit = guest ? 8 : 60;
  if (rateLimited(`${guest ? "guest" : admin ? "admin" : "merchant"}:${clientKey(request)}`, limit)) {
    return NextResponse.json({ error: "Too many uploads. Please wait a minute and try again." }, { status: 429 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  const maxBytes = guest ? GUEST_MAX_BYTES : MAX_BYTES;

  if (contentType.includes("application/json")) {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Send the image link as JSON." }, { status: 400 });
    }
    const payload = (body ?? {}) as { url?: unknown; folder?: unknown };
    const folder = payload.folder;
    if (!isUploadFolder(folder)) {
      return NextResponse.json({ error: "Choose a valid upload folder." }, { status: 400 });
    }
    const denied = folderError(folder, guest, Boolean(merchant));
    if (denied) return denied;

    if (typeof payload.url !== "string" || !payload.url.trim()) {
      return NextResponse.json({ error: "Paste an image link to import." }, { status: 400 });
    }

    try {
      const { data, fileName } = await downloadImage(payload.url.trim(), maxBytes);
      const asset = await uploadImage({ data, folder, fileName, tags: ["url-import"] });
      return NextResponse.json({ asset }, { status: 201 });
    } catch (error) {
      if (error instanceof UrlImportError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      console.error("[uploads] URL import failed", error);
      return NextResponse.json(
        { error: "That image link could not be imported right now. Try uploading the file instead." },
        { status: 502 },
      );
    }
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Send the image as multipart form data." }, { status: 400 });
  }

  const folder = form.get("folder");
  if (!isUploadFolder(folder)) {
    return NextResponse.json({ error: "Choose a valid upload folder." }, { status: 400 });
  }
  const denied = folderError(folder, guest, Boolean(merchant));
  if (denied) return denied;

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Use a JPG, PNG, WebP, AVIF or GIF image." }, { status: 415 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "This file is empty." }, { status: 400 });
  }
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: guest ? "Application images must be 4 MB or smaller." : "Images must be 8 MB or smaller." },
      { status: 413 },
    );
  }

  try {
    const asset = await uploadImage({
      data: new Uint8Array(await file.arrayBuffer()),
      folder,
      fileName: file.name || "upload",
    });
    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    console.error("[uploads] Cloudinary upload failed", error);
    return NextResponse.json(
      { error: "The image could not be uploaded right now. Please try again." },
      { status: 502 },
    );
  }
}
