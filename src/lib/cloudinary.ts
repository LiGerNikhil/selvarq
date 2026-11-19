import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { cloudinaryConfig, isCloudinaryConfigured } from "@/lib/env";
import { UPLOAD_FOLDERS, type UploadFolderKey } from "@/lib/upload-folders";

export interface UploadedImage {
  publicId: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  originalName: string;
}

let configuredFor: string | null = null;

function client() {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.");
  }
  // Reconfigure only when the cloud changes (e.g. hot reload with a new .env).
  if (configuredFor !== cloudinaryConfig.cloudName) {
    cloudinary.config({
      cloud_name: cloudinaryConfig.cloudName,
      api_key: cloudinaryConfig.apiKey,
      api_secret: cloudinaryConfig.apiSecret,
      secure: true,
    });
    configuredFor = cloudinaryConfig.cloudName;
  }
  return cloudinary;
}

function toUploadedImage(result: UploadApiResponse, originalName: string): UploadedImage {
  return {
    publicId: result.public_id,
    url: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
    originalName,
  };
}

/**
 * Uploads one image buffer to Cloudinary. The API secret never leaves the
 * server: the browser posts the file to /api/uploads, not to Cloudinary.
 */
export async function uploadImage(input: {
  data: Uint8Array;
  folder: UploadFolderKey;
  fileName: string;
  tags?: string[];
}): Promise<UploadedImage> {
  const sdk = client();
  const folder = UPLOAD_FOLDERS[input.folder];
  // upload_stream has no file name of its own: without `filename` Cloudinary
  // would name every asset after the multipart field ("file_ab12cd").
  const baseName = input.fileName.replace(/\.[a-z0-9]+$/i, "").replace(/[^a-z0-9_-]+/gi, "-").slice(0, 60) || "image";

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = sdk.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        filename: baseName,
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        ...(input.tags?.length ? { tags: input.tags } : {}),
      },
      (error, response) => {
        if (error) reject(new Error(error.message || "Cloudinary rejected the upload."));
        else if (!response) reject(new Error("Cloudinary returned an empty upload response."));
        else resolve(response);
      },
    );
    stream.end(input.data);
  });

  return toUploadedImage(result, input.fileName);
}

/** Removes an asset from Cloudinary. Only call for ids owned by this app. */
export async function deleteImage(publicId: string): Promise<void> {
  const sdk = client();
  await sdk.uploader.destroy(publicId, { invalidate: true, resource_type: "image" });
}
