import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Job } from "@/models/Job";
import { requireAdmin, AdminAuthError } from "@/lib/auth";
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { generateSlug } from "@/lib/slug";
import { sanitizeHtml } from "@/lib/sanitize";
import { jobCreateSchema } from "@/validators/job.validator";

async function ensureUniqueSlug(base: string): Promise<string> {
  let slug = generateSlug(base);
  if (!slug) slug = "job";
  let candidate = slug;
  let counter = 2;
  while (true) {
    const exists = await Job.exists({ slug: candidate });
    if (!exists) return candidate;
    candidate = `${slug}-${counter++}`;
  }
}

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

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const department = searchParams.get("department");
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 20)));

    const filter: Record<string, unknown> = {};
    if (status && ["draft", "published", "archived"].includes(status)) {
      filter.status = status;
    }
    if (department) filter.department = department;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .sort({ order: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Job.countDocuments(filter),
    ]);

    return successResponse("Jobs loaded successfully.", {
      jobs: jobs.map((j) => serializeJob(j)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[GET /api/admin/jobs]", err);
    return errorResponse("Failed to load jobs.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    await connectDB();

    const json = await request.json().catch(() => null);
    if (!json || typeof json !== "object") {
      return errorResponse("Invalid request body.", 400);
    }

    const parsed = jobCreateSchema.safeParse(json);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.flatten().fieldErrors);
    }
    const data = parsed.data;
    const slug = await ensureUniqueSlug(data.slug || data.title);

    const job = await Job.create({
      ...data,
      slug,
      description: data.description ? sanitizeHtml(data.description) : undefined,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      createdBy: new mongoose.Types.ObjectId(admin.id),
      updatedBy: new mongoose.Types.ObjectId(admin.id),
      publishedAt: data.status === "published" ? new Date() : undefined,
    });

    revalidatePath("/careers");
    revalidatePath(`/careers/${job.slug}`);

    return successResponse(
      "Job created successfully.",
      { job: serializeJob(job.toObject()) },
      201
    );
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[POST /api/admin/jobs]", err);
    return errorResponse("Failed to create job.");
  }
}
