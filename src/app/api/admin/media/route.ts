import type { NextRequest } from "next/server";
import { requireAdmin, AdminAuthError } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { MediaAsset } from "@/models/MediaAsset";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import type { MediaAssetType, MediaAssetStatus } from "@/models/MediaAsset";

export const runtime = "nodejs";

/** GET /api/admin/media */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type") as MediaAssetType | null;
    const folder = searchParams.get("folder");
    const status = (searchParams.get("status") ?? "active") as MediaAssetStatus;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));

    const filter: Record<string, unknown> = { status };
    if (type) filter.type = type;
    if (folder) filter.folder = folder;

    const [assets, total] = await Promise.all([
      MediaAsset.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      MediaAsset.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return successResponse("Media assets loaded.", {
      assets: assets.map((a) => ({
        id: String(a._id),
        url: a.url,
        secureUrl: a.secureUrl,
        publicId: a.publicId,
        fileId: a.fileId,
        provider: a.provider,
        type: a.type,
        resourceType: a.resourceType,
        filename: a.filename,
        originalFilename: a.originalFilename,
        altText: a.altText,
        folder: a.folder,
        format: a.format,
        size: a.size,
        width: a.width,
        height: a.height,
        mimeType: a.mimeType,
        usage: a.usage,
        status: a.status,
        createdAt: a.createdAt,
      })),
      pagination: { page, limit, total, totalPages },
    });
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return unauthorizedResponse();
    }
    console.error("[GET /api/admin/media]", err);
    return errorResponse("Failed to load media assets.");
  }
}
