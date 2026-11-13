/** Prefix for built-in generated placeholders, e.g. "placeholder:poplin-shirt". */
export const PLACEHOLDER_PREFIX = "placeholder:";

export function isPlaceholder(src: string): boolean {
  return src.startsWith(PLACEHOLDER_PREFIX);
}

/**
 * Resolves what the data layer stores (a public id or a URL) to something
 * next/image can load. This is the one seam for Cloudinary in P13.
 *
 * - absolute URL or root-relative path: used as is
 * - bare public id with NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME set: Cloudinary delivery URL
 * - bare public id otherwise: /media/<id> in public/
 */
export function resolveMediaSrc(src: string): string {
  if (/^https?:\/\//i.test(src) || src.startsWith("/")) return src;
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (cloud) return `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto/${src}`;
  return `/media/${src}`;
}
