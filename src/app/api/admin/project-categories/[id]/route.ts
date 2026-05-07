import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAdmin, AdminAuthError } from "@/lib/auth";
import { ProjectCategory } from "@/models/ProjectCategory";
import {
  errorResponse,
  notFoundResponse,
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { generateSlug } from "@/lib/slug";
import { projectCategoryUpdateSchema } from "@/validators/project-category.validator";

function serializeCategory(category: unknown) {
  const item = category as { _id: unknown } & Record<string, unknown>;
  return {
    id: String(item._id),
    ...item,
    _id: undefined,
  };
}

async function ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = generateSlug(base);
  if (!slug) slug = "project-category";
  let candidate = slug;
  let counter = 2;
  while (true) {
    const exists = await ProjectCategory.exists({
      slug: candidate,
      ...(excludeId ? { _id: { $ne: new mongoose.Types.ObjectId(excludeId) } } : {}),
    });
    if (!exists) return candidate;
    candidate = `${slug}-${counter++}`;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return errorResponse("Invalid category ID.", 400);
    }

    const category = await ProjectCategory.findById(id).lean();
    if (!category) return notFoundResponse("Project category not found.");

    return successResponse("Project category loaded successfully.", {
      category: serializeCategory(category),
    });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[GET /api/admin/project-categories/[id]]", err);
    return errorResponse("Failed to load project category.");
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
      return errorResponse("Invalid category ID.", 400);
    }

    const existing = await ProjectCategory.findById(id);
    if (!existing) return notFoundResponse("Project category not found.");

    const json = await request.json().catch(() => null);
    if (!json || typeof json !== "object") {
      return errorResponse("Invalid request body.", 400);
    }

    const parsed = projectCategoryUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.flatten().fieldErrors);
    }
    const data = parsed.data;
    const updatePayload: Record<string, unknown> = { ...data };
    if (data.slug || data.name) {
      const slugBase = data.slug || data.name || existing.name;
      updatePayload.slug = await ensureUniqueSlug(slugBase, id);
    }
    updatePayload.updatedBy = new mongoose.Types.ObjectId(admin.id);

    const updated = await ProjectCategory.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    }).lean();
    if (!updated) return notFoundResponse("Project category not found.");

    return successResponse("Project category updated successfully.", {
      category: serializeCategory(updated),
    });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[PATCH /api/admin/project-categories/[id]]", err);
    return errorResponse("Failed to update project category.");
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
      return errorResponse("Invalid category ID.", 400);
    }

    const archived = await ProjectCategory.findByIdAndUpdate(
      id,
      { status: "archived" },
      { new: true }
    ).lean();
    if (!archived) return notFoundResponse("Project category not found.");

    return successResponse("Project category archived successfully.", {
      category: serializeCategory(archived),
    });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[DELETE /api/admin/project-categories/[id]]", err);
    return errorResponse("Failed to archive project category.");
  }
}

