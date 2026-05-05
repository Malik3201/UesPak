import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import { requireAdmin, AdminAuthError } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { deleteFromImageKit } from "@/lib/imagekit";
import { MediaAsset } from "@/models/MediaAsset";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/api-response";

export const runtime = "nodejs";

/** DELETE /api/admin/media/[id] — soft-archives and removes from ImageKit when possible */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return errorResponse("Invalid asset ID.", 400);
    }

    await connectDB();

    const asset = await MediaAsset.findById(id);
    if (!asset) {
      return notFoundResponse("Media asset not found.");
    }

    if (asset.status === "archived") {
      return successResponse("Asset is already archived.");
    }

    // Delete from ImageKit (best effort, only when fileId is available)
    try {
      if (asset.fileId) {
        await deleteFromImageKit(asset.fileId);
      } else {
        // Compatibility: older Cloudinary-era records may not have ImageKit fileId.
        console.warn(
          "[DELETE /api/admin/media] Missing fileId for remote deletion; archiving DB record only."
        );
      }
    } catch (remoteErr) {
      console.warn(
        "[DELETE /api/admin/media] ImageKit delete warning — proceeding with DB archive:",
        remoteErr
      );
    }

    // Soft-archive in DB
    asset.status = "archived";
    await asset.save();

    return successResponse("Asset archived successfully.", {
      id: String(asset._id),
      status: asset.status,
    });
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return unauthorizedResponse();
    }
    console.error("[DELETE /api/admin/media]", err);
    return errorResponse("Failed to delete media asset.");
  }
}
