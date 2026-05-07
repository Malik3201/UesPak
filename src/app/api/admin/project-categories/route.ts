import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAdmin, AdminAuthError } from "@/lib/auth";
import { ProjectCategory } from "@/models/ProjectCategory";
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { generateSlug } from "@/lib/slug";
import { projectCategoryCreateSchema } from "@/validators/project-category.validator";

function serializeCategory(category: unknown) {
  const item = category as { _id: unknown } & Record<string, unknown>;
  return {
    id: String(item._id),
    ...item,
    _id: undefined,
  };
}

async function ensureUniqueSlug(base: string): Promise<string> {
  let slug = generateSlug(base);
  if (!slug) slug = "project-category";
  let candidate = slug;
  let counter = 2;
  while (true) {
    const exists = await ProjectCategory.exists({ slug: candidate });
    if (!exists) return candidate;
    candidate = `${slug}-${counter++}`;
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const projectGroup = searchParams.get("projectGroup");
    const search = searchParams.get("search");
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 20)));

    const filter: Record<string, unknown> = {};
    if (status && ["active", "inactive", "archived"].includes(status)) {
      filter.status = status;
    }
    if (projectGroup && ["engineering", "agriculture", "industrialAutomation"].includes(projectGroup)) {
      filter.projectGroup = projectGroup;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const [categories, total] = await Promise.all([
      ProjectCategory.find(filter)
        .sort({ order: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ProjectCategory.countDocuments(filter),
    ]);

    return successResponse("Project categories loaded successfully.", {
      categories: categories.map((c) => serializeCategory(c)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[GET /api/admin/project-categories]", err);
    return errorResponse("Failed to load project categories.");
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

    const parsed = projectCategoryCreateSchema.safeParse(json);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.flatten().fieldErrors);
    }
    const data = parsed.data;
    const slug = await ensureUniqueSlug(data.slug || data.name);

    const category = await ProjectCategory.create({
      ...data,
      slug,
      createdBy: new mongoose.Types.ObjectId(admin.id),
      updatedBy: new mongoose.Types.ObjectId(admin.id),
    });

    return successResponse(
      "Project category created successfully.",
      { category: serializeCategory(category.toObject()) },
      201
    );
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[POST /api/admin/project-categories]", err);
    return errorResponse("Failed to create project category.");
  }
}

