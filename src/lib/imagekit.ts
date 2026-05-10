import ImageKit from "@imagekit/nodejs";
import { MEDIA_UPLOAD_FOLDERS } from "@/constants/media-folders";
import { resolveMediaType } from "@/validators/media.validator";

export interface UploadToImageKitOptions {
  fileBuffer: Buffer;
  fileName: string;
  folder: string;
  mimeType: string;
  altText?: string;
  usage?: string;
}

export interface ImageKitUploadResultNormalized {
  url: string;
  secureUrl: string;
  publicId: string;
  fileId: string;
  filename: string;
  originalFilename: string;
  type: "image" | "pdf" | "document" | "video" | "other";
  resourceType: "image" | "raw";
  folder: string;
  format: string;
  size: number;
  width?: number;
  height?: number;
  mimeType: string;
  altText?: string;
  usage?: string;
}

export const imagekitConfig = {
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
} as const;

export const imagekit = new ImageKit({
  privateKey: imagekitConfig.privateKey,
  password: "",
});

const VALID_FOLDERS = new Set(Object.values(MEDIA_UPLOAD_FOLDERS));

export function resolveMediaFolder(raw?: string | null): string {
  if (!raw) return MEDIA_UPLOAD_FOLDERS.general;
  const trimmed = raw.trim();
  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (VALID_FOLDERS.has(normalized as (typeof MEDIA_UPLOAD_FOLDERS)[keyof typeof MEDIA_UPLOAD_FOLDERS])) {
    return normalized;
  }
  if (VALID_FOLDERS.has(trimmed as (typeof MEDIA_UPLOAD_FOLDERS)[keyof typeof MEDIA_UPLOAD_FOLDERS])) {
    return trimmed;
  }
  return MEDIA_UPLOAD_FOLDERS.general;
}

export function hasImageKitConfig(): boolean {
  return Boolean(
    imagekitConfig.publicKey &&
      imagekitConfig.privateKey &&
      imagekitConfig.urlEndpoint
  );
}

export async function uploadToImageKit({
  fileBuffer,
  fileName,
  folder,
  mimeType,
  altText,
  usage,
}: UploadToImageKitOptions): Promise<ImageKitUploadResultNormalized> {
  const normalizedFolder = resolveMediaFolder(folder);
  const fileType = resolveMediaType(mimeType);
  const isImage = fileType === "image";

  const privateKey = imagekitConfig.privateKey?.trim();
  if (!privateKey) {
    throw new Error("IMAGEKIT_PRIVATE_KEY is missing.");
  }

  const authHeader = Buffer.from(`${privateKey}:`).toString("base64");

  const formData = new FormData();
  formData.append(
    "file",
    new Blob([new Uint8Array(fileBuffer)], { type: mimeType })
  );
  formData.append("fileName", fileName);
  formData.append("folder", normalizedFolder);
  formData.append("useUniqueFileName", "true");
  const tags = [usage, fileType].filter(Boolean).join(",");
  if (tags) {
    formData.append("tags", tags);
  }

  const uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: {
      Authorization: `Basic ${authHeader}`,
    },
    body: formData,
  });

  if (!uploadRes.ok) {
    const errorJson = await uploadRes.json().catch(() => null);
    const message =
      errorJson?.message ||
      `ImageKit upload failed with status ${uploadRes.status}.`;
    throw new Error(message);
  }

  const response = (await uploadRes.json()) as {
    url: string;
    fileId: string;
    name: string;
    size: number;
    width?: number;
    height?: number;
    filePath?: string;
  };

  const formatFromName = fileName.includes(".")
    ? fileName.split(".").pop()?.toLowerCase() ?? ""
    : "";
  const effectiveUrl =
    response.url ||
    (imagekitConfig.urlEndpoint && response.filePath
      ? `${imagekitConfig.urlEndpoint.replace(/\/$/, "")}${response.filePath}`
      : "");

  return {
    url: effectiveUrl,
    secureUrl: effectiveUrl,
    publicId: response.filePath || response.fileId,
    fileId: response.fileId,
    filename: response.name,
    originalFilename: fileName,
    type: fileType,
    resourceType: isImage ? "image" : "raw",
    folder: normalizedFolder,
    format: formatFromName,
    size: response.size,
    width: typeof response.width === "number" ? response.width : undefined,
    height: typeof response.height === "number" ? response.height : undefined,
    mimeType,
    altText,
    usage,
  };
}

export async function deleteFromImageKit(fileId: string): Promise<void> {
  const privateKey = imagekitConfig.privateKey?.trim();
  if (!privateKey) {
    throw new Error("IMAGEKIT_PRIVATE_KEY is missing.");
  }
  const authHeader = Buffer.from(`${privateKey}:`).toString("base64");
  const res = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Basic ${authHeader}`,
    },
  });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    const message =
      errorJson?.message ||
      `ImageKit delete failed with status ${res.status}.`;
    throw new Error(message);
  }
}
