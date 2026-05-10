import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import { requireAdmin, AdminAuthError } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import {
  uploadToImageKit,
  resolveMediaFolder,
  hasImageKitConfig,
} from "@/lib/imagekit";
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

/** POST /api/admin/upload */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    // Verify ImageKit config is present
    if (!hasImageKitConfig()) {
      return errorResponse(
        "ImageKit is not configured. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT.",
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
        `File type "${mimeType}" is not allowed. Allowed types: JPEG, PNG, WebP, SVG, PDF, MP4, WebM, MOV.`,
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

    const folder = resolveMediaFolder(folderRaw);
    const assetType = resolveMediaType(mimeType);

    // Convert File → Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to ImageKit
    let uploadResult;
    try {
      uploadResult = await uploadToImageKit({
        fileBuffer: buffer,
        fileName: file.name,
        folder,
        mimeType,
        altText,
        usage,
      });
    } catch (uploadErr) {
      console.error("[POST /api/admin/upload] ImageKit error:", uploadErr);
      return errorResponse(
        "Failed to upload file to ImageKit. Please check your configuration and try again.",
        502
      );
    }

    await connectDB();

    const asset = await MediaAsset.create({
      url: uploadResult.url,
      secureUrl: uploadResult.secureUrl,
      publicId: uploadResult.publicId,
      fileId: uploadResult.fileId,
      provider: "imagekit",
      type: assetType,
      resourceType: uploadResult.resourceType,
      filename: uploadResult.filename,
      originalFilename: uploadResult.originalFilename,
      altText,
      folder,
      format: uploadResult.format,
      size: uploadResult.size,
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
          fileId: asset.fileId,
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
