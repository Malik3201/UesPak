import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import { requireAdmin, AdminAuthError } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { CLOUDINARY_FOLDERS } from "@/constants/cloudinary-folders";
import { MediaAsset } from "@/models/MediaAsset";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import {
  validateMimeType,
  validateFileSize,
  resolveMediaType,
} from "@/validators/media.validator";

export const runtime = "nodejs";

const VALID_FOLDERS = new Set(Object.values(CLOUDINARY_FOLDERS));

function resolveFolder(raw: string | null): string {
  if (!raw) return CLOUDINARY_FOLDERS.general;
  const trimmed = raw.trim();
  if (VALID_FOLDERS.has(trimmed as (typeof CLOUDINARY_FOLDERS)[keyof typeof CLOUDINARY_FOLDERS])) {
    return trimmed;
  }
  return CLOUDINARY_FOLDERS.general;
}

/** POST /api/admin/upload */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    // Verify Cloudinary config is present
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return errorResponse(
        "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
        500
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return errorResponse("Failed to parse multipart form data.", 400);
    }

    const file = formData.get("file") as File | null;
    const folderRaw = formData.get("folder") as string | null;
    const altText = (formData.get("altText") as string | null)?.trim() || undefined;
    const usage = (formData.get("usage") as string | null)?.trim() || undefined;

    if (!file || !(file instanceof File)) {
      return errorResponse("No file provided. Include a 'file' field in the form data.", 400);
    }

    const mimeType = file.type || "";
    if (!validateMimeType(mimeType)) {
      return errorResponse(
        `File type "${mimeType}" is not allowed. Allowed types: JPEG, PNG, WebP, SVG, PDF.`,
        400
      );
    }

    const { valid: sizeValid, maxMB } = validateFileSize(file.size, mimeType);
    if (!sizeValid) {
      return errorResponse(
        `File is too large. Maximum allowed size is ${maxMB}MB for this file type.`,
        400
      );
    }

    const folder = resolveFolder(folderRaw);
    const assetType = resolveMediaType(mimeType);
    const isPdf = mimeType === "application/pdf";
    const resourceType = isPdf ? "raw" : "image";

    // Convert File → Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    let uploadResult;
    try {
      uploadResult = await uploadToCloudinary(buffer, {
        folder,
        resourceType: resourceType as "image" | "raw",
      });
    } catch (uploadErr) {
      console.error("[POST /api/admin/upload] Cloudinary error:", uploadErr);
      return errorResponse(
        "Failed to upload file to Cloudinary. Please check your configuration and try again.",
        502
      );
    }

    await connectDB();

    const asset = await MediaAsset.create({
      url: uploadResult.url,
      secureUrl: uploadResult.secureUrl,
      publicId: uploadResult.publicId,
      type: assetType,
      resourceType: uploadResult.resourceType as "image" | "video" | "raw",
      filename: file.name,
      originalFilename: file.name,
      altText,
      folder,
      format: uploadResult.format,
      size: uploadResult.bytes,
      width: uploadResult.width,
      height: uploadResult.height,
      mimeType,
      usage,
      uploadedBy: new mongoose.Types.ObjectId(admin.id),
      status: "active",
    });

    return successResponse(
      "File uploaded successfully.",
      {
        asset: {
          id: (asset._id as mongoose.Types.ObjectId).toString(),
          url: asset.url,
          secureUrl: asset.secureUrl,
          publicId: asset.publicId,
          type: asset.type,
          filename: asset.filename,
          originalFilename: asset.originalFilename,
          altText: asset.altText,
          folder: asset.folder,
          format: asset.format,
          size: asset.size,
          width: asset.width,
          height: asset.height,
          mimeType: asset.mimeType,
          usage: asset.usage,
        },
      },
      201
    );
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return unauthorizedResponse();
    }
    console.error("[POST /api/admin/upload]", err);
    return errorResponse("Upload failed. Please try again.");
  }
}
