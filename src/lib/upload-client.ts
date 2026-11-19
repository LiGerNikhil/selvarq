import type { UploadFolderKey } from "@/lib/upload-folders";

export interface UploadedImage {
  publicId: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  originalName: string;
}

/** 8 MB is enough for a high-resolution product shot. */
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"] as const;

export const ACCEPTED_IMAGE_ACCEPT = ACCEPTED_IMAGE_TYPES.join(",");

/** Client-side guard so obvious mistakes never reach the network. */
export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return "Use a JPG, PNG, WebP, AVIF or GIF image.";
  }
  if (file.size === 0) return "This file is empty.";
  if (file.size > MAX_IMAGE_BYTES) return "Images must be 8 MB or smaller.";
  return null;
}

/** Sends one image to /api/uploads, which signs and forwards it to Cloudinary. */
export async function uploadImage(file: File, folder: UploadFolderKey): Promise<UploadedImage> {
  const invalid = validateImageFile(file);
  if (invalid) throw new Error(invalid);

  const body = new FormData();
  body.append("file", file);
  body.append("folder", folder);

  const response = await fetch("/api/uploads", { method: "POST", body });
  const result = (await response.json().catch(() => ({}))) as { asset?: UploadedImage; error?: string };
  if (!response.ok || !result.asset) {
    throw new Error(result.error ?? "The image could not be uploaded.");
  }
  return result.asset;
}

/**
 * Imports a pasted image link. The server downloads it and stores it in
 * Cloudinary, so the catalogue never points next/image at an unknown host.
 */
export async function uploadImageFromUrl(url: string, folder: UploadFolderKey): Promise<UploadedImage> {
  const response = await fetch("/api/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, folder }),
  });
  const result = (await response.json().catch(() => ({}))) as { asset?: UploadedImage; error?: string };
  if (!response.ok || !result.asset) {
    throw new Error(result.error ?? "That image link could not be imported.");
  }
  return result.asset;
}
