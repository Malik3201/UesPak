import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { requireAdmin, AdminAuthError } from "@/lib/auth";
import { Project } from "@/models/Project";
import { ProjectCategory } from "@/models/ProjectCategory";
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { generateSlug } from "@/lib/slug";
import { sanitizeHtml } from "@/lib/sanitize";
import { projectCreateSchema } from "@/validators/project.validator";
import { getProjectGroupSlug } from "@/types/project";

function serializeProject(project: unknown) {
  const item = project as { _id: unknown } & Record<string, unknown>;
  return {
    id: String(item._id),
    ...item,
    _id: undefined,
  };
}

async function ensureUniqueSlug(base: string): Promise<string> {
  let slug = generateSlug(base);
  if (!slug) slug = "project";
  let candidate = slug;
  let counter = 2;
  while (true) {
    const exists = await Project.exists({ slug: candidate });
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

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const projectGroup = searchParams.get("projectGroup");
    const categoryId = searchParams.get("categoryId");
    const featured = searchParams.get("featured");
    const serviceId = searchParams.get("serviceId");
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 20)));

    const filter: Record<string, unknown> = {};
    if (status && ["draft", "published", "archived"].includes(status)) {
      filter.status = status;
    }
    if (projectGroup && ["engineering", "agriculture", "industrialAutomation"].includes(projectGroup)) {
      filter.projectGroup = projectGroup;
    }
    if (categoryId && mongoose.isValidObjectId(categoryId)) {
      filter.categoryIds = new mongoose.Types.ObjectId(categoryId);
    }
    if (serviceId && mongoose.isValidObjectId(serviceId)) {
      filter.linkedServices = new mongoose.Types.ObjectId(serviceId);
    }
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

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .sort({ order: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Project.countDocuments(filter),
    ]);

    return successResponse("Projects loaded successfully.", {
      projects: projects.map((p) => serializeProject(p)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[GET /api/admin/projects]", err);
    return errorResponse("Failed to load projects.");
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

    const parsed = projectCreateSchema.safeParse(json);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.flatten().fieldErrors);
    }
    const data = parsed.data;
    const slug = await ensureUniqueSlug(data.slug || data.title);
    const categoriesSnapshot =
      data.categoriesSnapshot?.length
        ? data.categoriesSnapshot
        : await resolveCategorySnapshot(data.categoryIds || []);

    const project = await Project.create({
      ...data,
      slug,
      content: data.content ? sanitizeHtml(data.content) : undefined,
      categoryIds: (data.categoryIds || []).map((id) => new mongoose.Types.ObjectId(id)),
      linkedServices: (data.linkedServices || []).map(
        (id) => new mongoose.Types.ObjectId(id)
      ),
      categoriesSnapshot,
      createdBy: new mongoose.Types.ObjectId(admin.id),
      updatedBy: new mongoose.Types.ObjectId(admin.id),
      publishedAt: data.status === "published" ? new Date() : undefined,
    });

    const groupSlug = getProjectGroupSlug(project.projectGroup);
    revalidatePath("/projects");
    revalidatePath(`/projects/${project.slug}`);
    revalidatePath(`/projects/group/${groupSlug}`);

    return successResponse(
      "Project created successfully.",
      { project: serializeProject(project.toObject()) },
      201
    );
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[POST /api/admin/projects]", err);
    return errorResponse("Failed to create project.");
  }
}

