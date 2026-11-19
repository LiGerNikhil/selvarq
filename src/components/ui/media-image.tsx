"use client";

import Image from "next/image";
import { useState } from "react";
import { isPlaceholder, resolveMediaSrc } from "@/lib/media";
import { cn } from "@/lib/utils";
import { PlaceholderArt } from "./placeholder-art";

const ratios = {
  "4/5": "4 / 5",
  "3/4": "3 / 4",
  "1/1": "1 / 1",
  "16/9": "16 / 9",
  "21/9": "21 / 9",
} as const;

export interface MediaImageProps {
  /** A public id (Cloudinary later), a URL, a /public path, or "placeholder:<seed>". */
  src: string;
  alt: string;
  /** Reserved box, so nothing shifts while the image loads. Default 4:5 portrait. */
  ratio?: keyof typeof ratios;
  /** Real display width per breakpoint; drives the srcset. Always set it for grids. */
  sizes?: string;
  /** Only for the LCP image on a page. */
  preload?: boolean;
  fit?: "cover" | "contain";
  className?: string;
}

/**
 * The only way images enter the UI. Resolves ids and URLs through lib/media,
 * reserves space, and falls back to a calm placeholder if loading fails.
 */
export function MediaImage({
  src,
  alt,
  ratio = "4/5",
  sizes = "(min-width: 1024px) 25vw, 50vw",
  preload = false,
  fit = "cover",
  className,
}: MediaImageProps) {
  const [failed, setFailed] = useState(false);
  const showPlaceholder = failed || !src || isPlaceholder(src);
  const resolved = resolveMediaSrc(src);
  // New links are imported to Cloudinary, but an older record may still point
  // at another host. Render it unoptimized instead of crashing the page with
  // next/image's "hostname is not configured" error.
  const unmanagedRemote =
    /^https?:\/\//i.test(resolved) && !/^https?:\/\/(?:res\.)?cloudinary\.com\//i.test(resolved);

  return (
    <div
      className={cn("relative w-full overflow-hidden bg-pearl", className)}
      style={{ aspectRatio: ratios[ratio] }}
    >
      {showPlaceholder ? (
        <PlaceholderArt seed={src} />
      ) : (
        <Image
          src={resolved}
          alt={alt}
          fill
          sizes={sizes}
          preload={preload}
          unoptimized={unmanagedRemote}
          onError={() => setFailed(true)}
          className={cn(fit === "cover" ? "object-cover" : "object-contain")}
        />
      )}
      {showPlaceholder ? <span className="sr-only">{alt}</span> : null}
    </div>
  );
}
