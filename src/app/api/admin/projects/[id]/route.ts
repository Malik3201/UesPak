import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { ProjectCategory } from "@/models/ProjectCategory";
import { requireAdmin, AdminAuthError } from "@/lib/auth";
import {
  errorResponse,
  notFoundResponse,
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { generateSlug } from "@/lib/slug";
import { sanitizeHtml } from "@/lib/sanitize";
import { projectUpdateSchema } from "@/validators/project.validator";
import { getProjectGroupSlug, type ProjectGroup } from "@/types/project";

function serializeProject(project: unknown) {
  const item = project as { _id: unknown } & Record<string, unknown>;
  return {
    id: String(item._id),
    ...item,
    _id: undefined,
  };
}

async function ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = generateSlug(base);
  if (!slug) slug = "project";
  let candidate = slug;
  let counter = 2;
  while (true) {
    const exists = await Project.exists({
      slug: candidate,
      ...(excludeId ? { _id: { $ne: new mongoose.Types.ObjectId(excludeId) } } : {}),
    });
    if (!exists) return candidate;
    candidate = `${slug}-${counter++}`;
  }
}

async function resolveCategorySnapshot(categoryIds: string[]) {
  if (!categoryIds.length) return [];
  const categories = await ProjectCategory.find({
    _id: { $in: categoryIds.map((id) => new mongoose.Types.ObjectId(id)) },
  })
    .select("_id name slug")
    .lean();
  return categories.map((c) => ({
    id: String(c._id),
    name: c.name,
    slug: c.slug,
  }));
}

function projectGroupValue(raw: unknown): ProjectGroup {
  return raw === "agriculture"
    ? "agriculture"
    : raw === "industrialAutomation"
      ? "industrialAutomation"
      : "engineering";
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
      return errorResponse("Invalid project ID.", 400);
    }

    const project = await Project.findById(id).lean();
    if (!project) return notFoundResponse("Project not found.");

    return successResponse("Project loaded successfully.", {
      project: serializeProject(project),
    });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[GET /api/admin/projects/[id]]", err);
    return errorResponse("Failed to load project.");
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
      return errorResponse("Invalid project ID.", 400);
    }

    const existing = await Project.findById(id);
    if (!existing) return notFoundResponse("Project not found.");

    const json = await request.json().catch(() => null);
    if (!json || typeof json !== "object") {
      return errorResponse("Invalid request body.", 400);
    }

    const parsed = projectUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.flatten().fieldErrors);
    }
    const data = parsed.data;
    const updatePayload: Record<string, unknown> = { ...data };

    if (data.slug || data.title) {
      const slugBase = data.slug || data.title || existing.title;
      updatePayload.slug = await ensureUniqueSlug(slugBase, id);
    }

    if (typeof data.content === "string") {
      updatePayload.content = sanitizeHtml(data.content);
    }
    if (data.categoryIds) {
      updatePayload.categoryIds = data.categoryIds.map(
        (cid) => new mongoose.Types.ObjectId(cid)
      );
      updatePayload.categoriesSnapshot = data.categoriesSnapshot?.length
        ? data.categoriesSnapshot
        : await resolveCategorySnapshot(data.categoryIds);
    }
    if (data.linkedServices) {
      updatePayload.linkedServices = data.linkedServices.map(
        (sid) => new mongoose.Types.ObjectId(sid)
      );
    }

    if (data.status === "published" && !existing.publishedAt) {
      updatePayload.publishedAt = new Date();
    }
    if (data.status && data.status !== "published") {
      updatePayload.publishedAt = undefined;
    }
    updatePayload.updatedBy = new mongoose.Types.ObjectId(admin.id);

    const updated = await Project.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    }).lean();
    if (!updated) return notFoundResponse("Project not found.");

    const groupSlug = getProjectGroupSlug(projectGroupValue(updated.projectGroup));
    revalidatePath("/projects");
    revalidatePath(`/projects/${updated.slug}`);
    revalidatePath(`/projects/group/${groupSlug}`);

    return successResponse("Project updated successfully.", {
      project: serializeProject(updated),
    });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[PATCH /api/admin/projects/[id]]", err);
    return errorResponse("Failed to update project.");
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
      return errorResponse("Invalid project ID.", 400);
    }

    const archived = await Project.findByIdAndUpdate(
      id,
      { status: "archived" },
      { new: true }
    ).lean();
    if (!archived) return notFoundResponse("Project not found.");

    const groupSlug = getProjectGroupSlug(projectGroupValue(archived.projectGroup));
    revalidatePath("/projects");
    revalidatePath(`/projects/${archived.slug}`);
    revalidatePath(`/projects/group/${groupSlug}`);

    return successResponse("Project archived successfully.", {
      project: serializeProject(archived),
    });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[DELETE /api/admin/projects/[id]]", err);
    return errorResponse("Failed to archive project.");
  }
}

