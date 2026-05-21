import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Redirect } from "@/models/Redirect";
import { requireAdmin, AdminAuthError } from "@/lib/auth";
import {
  errorResponse,
  notFoundResponse,
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { redirectUpdateSchema } from "@/validators/redirect.validator";
import {
  clearRedirectCache,
  serializeRedirect,
  wouldCreateRedirectLoop,
} from "@/lib/redirects";
import type { IRedirect } from "@/models/Redirect";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return errorResponse("Invalid redirect ID.", 400);
    }

    const doc = await Redirect.findById(id).lean();
    if (!doc) return notFoundResponse("Redirect not found.");

    return successResponse("Redirect loaded successfully.", {
      redirect: serializeRedirect(doc as IRedirect & { _id: unknown }),
    });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[GET /api/admin/redirects/[id]]", err);
    return errorResponse("Failed to load redirect.");
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    await connectDB();
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return errorResponse("Invalid redirect ID.", 400);
    }

    const existing = await Redirect.findById(id);
    if (!existing) return notFoundResponse("Redirect not found.");

    const json = await request.json().catch(() => null);
    if (!json || typeof json !== "object") {
      return errorResponse("Invalid request body.", 400);
    }

    const parsed = redirectUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.flatten().fieldErrors);
    }

    const data = parsed.data;
    const fromPath = data.fromPath ?? existing.fromPath;
    const toPath = data.toPath ?? existing.toPath;

    if (data.fromPath && data.fromPath !== existing.fromPath) {
      const dup = await Redirect.exists({
        fromPath: data.fromPath,
        _id: { $ne: id },
      });
      if (dup) {
        return errorResponse("A redirect for this from path already exists.", 409);
      }
    }

    if (await wouldCreateRedirectLoop(fromPath, toPath, id)) {
      return errorResponse("This redirect would create a loop.", 400);
    }

    Object.assign(existing, data, {
      updatedBy: new mongoose.Types.ObjectId(admin.id),
    });
    await existing.save();
    clearRedirectCache();

    return successResponse("Redirect updated successfully.", {
      redirect: serializeRedirect(existing.toObject() as IRedirect & { _id: unknown }),
    });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[PATCH /api/admin/redirects/[id]]", err);
    return errorResponse("Failed to update redirect.");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return errorResponse("Invalid redirect ID.", 400);
    }

    const deleted = await Redirect.findByIdAndDelete(id);
    if (!deleted) return notFoundResponse("Redirect not found.");

    clearRedirectCache();

    return successResponse("Redirect deleted successfully.");
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[DELETE /api/admin/redirects/[id]]", err);
    return errorResponse("Failed to delete redirect.");
  }
}
