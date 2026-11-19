/** Prefix for built-in generated placeholders, e.g. "placeholder:poplin-shirt". */
export const PLACEHOLDER_PREFIX = "placeholder:";

/** Optional explicit prefix for Cloudinary public ids, e.g. "cloudinary:selvarq/products/x". */
export const CLOUDINARY_PREFIX = "cloudinary:";

export function isPlaceholder(src: string): boolean {
  return src.startsWith(PLACEHOLDER_PREFIX);
}

export function isCloudinaryId(src: string): boolean {
  return src.startsWith(CLOUDINARY_PREFIX) || (!/^https?:\/\//i.test(src) && !src.startsWith("/") && !isPlaceholder(src));
}

export interface MediaTransform {
  width?: number;
  height?: number;
  /** Cloudinary crop mode, e.g. "fill", "fit", "limit". */
  crop?: "fill" | "fit" | "limit" | "scale";
}

/**
 * Resolves what the data layer stores (a Cloudinary public id or a URL) to
 * something next/image can load.
 *
 * - absolute URL or root-relative path: used as is
 * - "placeholder:<seed>": handled by <MediaImage> before this runs
 * - bare public id with NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME set: Cloudinary delivery URL
 * - bare public id otherwise: /media/<id> in public/
 */
export function resolveMediaSrc(src: string, transform: MediaTransform = {}): string {
  if (/^https?:\/\//i.test(src) || src.startsWith("/")) return src;

  const publicId = src.startsWith(CLOUDINARY_PREFIX) ? src.slice(CLOUDINARY_PREFIX.length) : src;
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloud) return `/media/${publicId}`;

  const parts = ["f_auto", "q_auto"];
  if (transform.width) parts.push(`w_${Math.round(transform.width)}`);
  if (transform.height) parts.push(`h_${Math.round(transform.height)}`);
  if (transform.crop) parts.push(`c_${transform.crop}`);
  return `https://res.cloudinary.com/${cloud}/image/upload/${parts.join(",")}/${publicId}`;
}

/**
 * Social platforms do not render the generated SVG placeholders, so share
 * cards only accept raster media: a URL, a root-relative raster path, or a
 * Cloudinary public id when a cloud name is configured.
 */
export function resolveShareImage(src?: string): string | undefined {
  if (!src || isPlaceholder(src)) return undefined;
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("/api/placeholder/")) return undefined;
  if (src.startsWith("/")) return /\.svg$/i.test(src) ? undefined : src;
  return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? resolveMediaSrc(src) : undefined;
}
