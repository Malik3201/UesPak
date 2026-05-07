import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Service } from "@/models/Service";
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
import { serviceUpdateSchema } from "@/validators/service.validator";

function serializeService(service: unknown) {
  const item = service as { _id: unknown } & Record<string, unknown>;
  return {
    id: String(item._id),
    ...item,
    _id: undefined,
  };
}

async function ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = generateSlug(base);
  if (!slug) slug = "service";
  let candidate = slug;
  let counter = 2;
  while (true) {
    const exists = await Service.exists({
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
      return errorResponse("Invalid service ID.", 400);
    }

    const service = await Service.findById(id).lean();
    if (!service) return notFoundResponse("Service not found.");

    return successResponse("Service loaded successfully.", {
      service: serializeService(service),
    });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[GET /api/admin/services/[id]]", err);
    return errorResponse("Failed to load service.");
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
      return errorResponse("Invalid service ID.", 400);
    }

    const existing = await Service.findById(id);
    if (!existing) return notFoundResponse("Service not found.");

    const json = await request.json().catch(() => null);
    if (!json || typeof json !== "object") {
      return errorResponse("Invalid request body.", 400);
    }

    const parsed = serviceUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.flatten().fieldErrors);
    }
    const data = parsed.data;
    const updatePayload: Record<string, unknown> = {
      ...data,
      ...(data.serviceGroup ? { serviceGroup: data.serviceGroup } : {}),
    };

    if (data.slug || data.title) {
      const slugBase = data.slug || data.title || existing.title;
      updatePayload.slug = await ensureUniqueSlug(slugBase, id);
    }

    if (typeof data.content === "string") {
      updatePayload.content = sanitizeHtml(data.content);
    }

    if (data.status === "published" && !existing.publishedAt) {
      updatePayload.publishedAt = new Date();
    }
    if (data.status && data.status !== "published") {
      updatePayload.publishedAt = undefined;
    }

    updatePayload.updatedBy = new mongoose.Types.ObjectId(admin.id);

    const updated = await Service.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    }).lean();
    if (!updated) return notFoundResponse("Service not found.");

    revalidatePath("/services");
    revalidatePath(`/services/${updated.slug}`);

    return successResponse("Service updated successfully.", {
      service: serializeService(updated),
    });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[PATCH /api/admin/services/[id]]", err);
    return errorResponse("Failed to update service.");
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
      return errorResponse("Invalid service ID.", 400);
    }

    const archived = await Service.findByIdAndUpdate(
      id,
      { status: "archived" },
      { new: true }
    ).lean();
    if (!archived) return notFoundResponse("Service not found.");

    revalidatePath("/services");
    revalidatePath(`/services/${archived.slug}`);

    return successResponse("Service archived successfully.", {
      service: serializeService(archived),
    });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[DELETE /api/admin/services/[id]]", err);
    return errorResponse("Failed to archive service.");
  }
}
