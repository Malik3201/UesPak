import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Job } from "@/models/Job";
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
import { jobUpdateSchema } from "@/validators/job.validator";

function serializeJob(job: unknown) {
  const item = job as { _id: unknown; deadline?: Date; publishedAt?: Date } & Record<
    string,
    unknown
  >;
  return {
    id: String(item._id),
    ...item,
    deadline: item.deadline ? new Date(item.deadline).toISOString() : undefined,
    publishedAt: item.publishedAt
      ? new Date(item.publishedAt).toISOString()
      : undefined,
    createdAt: item.createdAt
      ? new Date(item.createdAt as string | Date).toISOString()
      : undefined,
    updatedAt: item.updatedAt
      ? new Date(item.updatedAt as string | Date).toISOString()
      : undefined,
    _id: undefined,
  };
}

async function ensureUniqueSlug(base: string, excludeId: string): Promise<string> {
  let slug = generateSlug(base);
  if (!slug) slug = "job";
  let candidate = slug;
  let counter = 2;
  while (true) {
    const exists = await Job.exists({
      slug: candidate,
      _id: { $ne: new mongoose.Types.ObjectId(excludeId) },
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
      return errorResponse("Invalid job ID.", 400);
    }

    const job = await Job.findById(id).lean();
    if (!job) return notFoundResponse("Job not found.");

    return successResponse("Job loaded successfully.", {
      job: serializeJob(job),
    });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[GET /api/admin/jobs/[id]]", err);
    return errorResponse("Failed to load job.");
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
      return errorResponse("Invalid job ID.", 400);
    }

    const existing = await Job.findById(id);
    if (!existing) return notFoundResponse("Job not found.");

    const json = await request.json().catch(() => null);
    if (!json || typeof json !== "object") {
      return errorResponse("Invalid request body.", 400);
    }

    const parsed = jobUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.flatten().fieldErrors);
    }
    const data = parsed.data;
    const updatePayload: Record<string, unknown> = { ...data };

    if (data.slug || data.title) {
      const slugBase = data.slug || data.title || existing.title;
      updatePayload.slug = await ensureUniqueSlug(slugBase, id);
    }

    if (typeof data.description === "string") {
      updatePayload.description = sanitizeHtml(data.description);
    }

    if (data.deadline) {
      updatePayload.deadline = new Date(data.deadline);
    } else if (data.deadline === null) {
      updatePayload.deadline = undefined;
    }

    if (data.status === "published" && !existing.publishedAt) {
      updatePayload.publishedAt = new Date();
    }
    if (data.status && data.status !== "published") {
      updatePayload.publishedAt = undefined;
    }

    updatePayload.updatedBy = new mongoose.Types.ObjectId(admin.id);

    const updated = await Job.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    }).lean();
    if (!updated) return notFoundResponse("Job not found.");

    revalidatePath("/careers");
    revalidatePath(`/careers/${updated.slug}`);

    return successResponse("Job updated successfully.", {
      job: serializeJob(updated),
    });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[PATCH /api/admin/jobs/[id]]", err);
    return errorResponse("Failed to update job.");
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
      return errorResponse("Invalid job ID.", 400);
    }

    const archived = await Job.findByIdAndUpdate(
      id,
      { status: "archived" },
      { new: true }
    ).lean();
    if (!archived) return notFoundResponse("Job not found.");

    revalidatePath("/careers");
    revalidatePath(`/careers/${archived.slug}`);

    return successResponse("Job archived successfully.", {
      job: serializeJob(archived),
    });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[DELETE /api/admin/jobs/[id]]", err);
    return errorResponse("Failed to archive job.");
  }
}
