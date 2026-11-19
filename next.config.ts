import type { NextConfig } from "next";
import { closeSync, existsSync, openSync, readSync } from "node:fs";
import path from "node:path";

/**
 * Reads public/brand/<file> at build/dev start and returns its PNG dimensions.
 */
function brandAsset(file: string) {
  const absent = { present: "0", width: "0", height: "0" };
  const full = path.join(process.cwd(), "public", "brand", file);
  if (!existsSync(full)) return absent;
  const fd = openSync(full, "r");
  try {
    const header = Buffer.alloc(24);
    readSync(fd, header, 0, 24, 0);
    const isPng = header.readUInt32BE(0) === 0x89504e47;
    if (!isPng) return absent;
    return {
      present: "1",
      width: String(header.readUInt32BE(16)),
      height: String(header.readUInt32BE(20)),
    };
  } finally {
    closeSync(fd);
  }
}

const logo = brandAsset("Selvarq-logo.png");
const monogram = brandAsset("monogram.png");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_LOGO_PRESENT: logo.present,
    NEXT_PUBLIC_LOGO_W: logo.width,
    NEXT_PUBLIC_LOGO_H: logo.height,
    NEXT_PUBLIC_MONOGRAM_PRESENT: monogram.present,
    NEXT_PUBLIC_MONOGRAM_W: monogram.width,
    NEXT_PUBLIC_MONOGRAM_H: monogram.height,
  },
  images: {
    // Cloudinary delivery URLs are declared here; uploads go through /api/uploads.
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;
