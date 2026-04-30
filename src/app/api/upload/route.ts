import { NextRequest } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { MediaAsset } from "@/models/MediaAsset";
import { connectDB } from "@/lib/db";
import { mediaUploadValidator } from "@/validators/media.validator";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    // Auth check (set by middleware)
    const headersList = await headers();
    const adminId = headersList.get("x-admin-id");
    if (!adminId) {
      const { unauthorizedResponse } = await import("@/lib/api-response");
      return unauthorizedResponse();
    }

    const formData = await req.formData().catch(() => null);
    if (!formData) return errorResponse("Invalid form data.", 400);

    const file = formData.get("file") as File | null;
    if (!file) return errorResponse("No file provided.", 400);

    // Validate metadata
    const metadata = {
      folder: (formData.get("folder") as string) ?? "uespak/general",
      altText: (formData.get("altText") as string) ?? undefined,
      caption: (formData.get("caption") as string) ?? undefined,
      tags: formData.getAll("tags") as string[],
    };

    const parsed = mediaUploadValidator.safeParse(metadata);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.flatten().fieldErrors);
    }

    // Convert file to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, {
      folder: parsed.data.folder,
      tags: parsed.data.tags,
    });

    // Persist to DB
    await connectDB();
    const asset = await MediaAsset.create({
      url: result.url,
      secureUrl: result.secureUrl,
      publicId: result.publicId,
      altText: parsed.data.altText,
      caption: parsed.data.caption,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
      resourceType: result.resourceType as "image" | "video" | "raw",
      folder: parsed.data.folder,
      tags: parsed.data.tags,
      uploadedBy: adminId,
    });

    return successResponse("File uploaded successfully.", asset, 201);
  } catch (err) {
    console.error("[POST /api/upload]", err);
    return errorResponse("Upload failed. Please try again.");
  }
}
