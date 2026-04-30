import { v2 as cloudinary, type UploadApiOptions } from "cloudinary";

// ─── Configure ─────────────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ─── Folder constants ──────────────────────────────────────────────────────────
export const CLOUDINARY_FOLDERS = {
  services: "uespak/services",
  projects: "uespak/projects",
  team: "uespak/team",
  profilePdf: "uespak/profile-pdf",
  general: "uespak/general",
} as const;

// ─── Upload helper ─────────────────────────────────────────────────────────────
export interface UploadOptions {
  folder: string;
  publicId?: string;
  resourceType?: "image" | "video" | "raw" | "auto";
  tags?: string[];
}

export interface UploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  resourceType: string;
}

/**
 * Upload a file to Cloudinary from a Buffer or a public URL string.
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  options: UploadOptions
): Promise<UploadResult> {
  const uploadOptions: UploadApiOptions = {
    folder: options.folder,
    resource_type: options.resourceType ?? "auto",
    ...(options.publicId && { public_id: options.publicId }),
    ...(options.tags && { tags: options.tags }),
  };

  if (Buffer.isBuffer(file)) {
    // Upload from Buffer using upload_stream
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error || !result) return reject(error ?? new Error("Upload failed"));
          resolve({
            url: result.url,
            secureUrl: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            resourceType: result.resource_type,
          });
        }
      );
      stream.end(file);
    });
  }

  // Upload from URL / data URI
  const result = await cloudinary.uploader.upload(file, uploadOptions);
  return {
    url: result.url,
    secureUrl: result.secure_url,
    publicId: result.public_id,
    format: result.format,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    resourceType: result.resource_type,
  };
}

/**
 * Delete an asset from Cloudinary by its public_id.
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image"
): Promise<void> {
  await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
}

export { cloudinary };
