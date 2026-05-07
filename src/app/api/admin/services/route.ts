import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Service } from "@/models/Service";
import { requireAdmin, AdminAuthError } from "@/lib/auth";
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { generateSlug } from "@/lib/slug";
import { sanitizeHtml } from "@/lib/sanitize";
import { serviceCreateSchema } from "@/validators/service.validator";

async function ensureUniqueSlug(base: string): Promise<string> {
  let slug = generateSlug(base);
  if (!slug) slug = "service";
  let candidate = slug;
  let counter = 2;
  while (true) {
    const exists = await Service.exists({ slug: candidate });
    if (!exists) return candidate;
    candidate = `${slug}-${counter++}`;
  }
}

function serializeService(service: unknown) {
  const item = service as { _id: unknown } & Record<string, unknown>;
  return {
    id: String(item._id),
    ...item,
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
    const category = searchParams.get("category");
    const serviceGroup = searchParams.get("serviceGroup");
    const featured = searchParams.get("featured");
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit") || 20))
    );

    const filter: Record<string, unknown> = {};
    if (status && ["draft", "published", "archived"].includes(status)) {
      filter.status = status;
    }
    if (serviceGroup && ["engineering", "agriculture"].includes(serviceGroup)) {
      filter.serviceGroup = serviceGroup;
    }
    if (category) filter.category = category;
    if (featured != null && featured !== "") {
      filter.isFeatured = featured === "true";
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    const [services, total] = await Promise.all([
      Service.find(filter)
        .sort({ order: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Service.countDocuments(filter),
    ]);

    return successResponse("Services loaded successfully.", {
      services: services.map((service) => serializeService(service)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[GET /api/admin/services]", err);
    return errorResponse("Failed to load services.");
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

    const parsed = serviceCreateSchema.safeParse(json);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.flatten().fieldErrors);
    }
    const data = parsed.data;
    const slug = await ensureUniqueSlug(data.slug || data.title);

    const service = await Service.create({
      ...data,
      serviceGroup: data.serviceGroup || "engineering",
      slug,
      content: data.content ? sanitizeHtml(data.content) : undefined,
      createdBy: new mongoose.Types.ObjectId(admin.id),
      updatedBy: new mongoose.Types.ObjectId(admin.id),
      publishedAt: data.status === "published" ? new Date() : undefined,
    });

    revalidatePath("/services");
    revalidatePath(`/services/${service.slug}`);

    return successResponse(
      "Service created successfully.",
      { service: serializeService(service.toObject()) },
      201
    );
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[POST /api/admin/services]", err);
    return errorResponse("Failed to create service.");
  }
}
