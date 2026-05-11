import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { TeamMember } from "@/models/TeamMember";
import { requireAdmin, AdminAuthError } from "@/lib/auth";
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { generateSlug } from "@/lib/slug";
import { teamMemberCreateSchema } from "@/validators/team-member.validator";
import { serializeTeamMember } from "@/lib/team";

async function ensureUniqueSlug(base: string): Promise<string> {
  let slug = generateSlug(base);
  if (!slug) slug = "team-member";
  let candidate = slug;
  let counter = 2;
  while (true) {
    const exists = await TeamMember.exists({ slug: candidate });
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
    const search = searchParams.get("search");
    const department = searchParams.get("department");
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
    if (department) filter.department = department;
    if (featured != null && featured !== "") {
      filter.isFeatured = featured === "true";
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { designation: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    const [members, total] = await Promise.all([
      TeamMember.find(filter)
        .sort({ order: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      TeamMember.countDocuments(filter),
    ]);

    return successResponse("Team members loaded successfully.", {
      teamMembers: members.map((m) =>
        serializeTeamMember(m as unknown as Record<string, unknown>)
      ),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[GET /api/admin/team]", err);
    return errorResponse("Failed to load team members.");
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

    if (process.env.NODE_ENV === "development") {
      const body = json as Record<string, unknown>;
      console.log("[TEAM DEBUG] POST incoming shortBio:", body.shortBio);
      console.log("[TEAM DEBUG] POST incoming expertise:", body.expertise);
      console.log(
        "[TEAM DEBUG] POST incoming qualifications:",
        body.qualifications
      );
      console.log("[TEAM DEBUG] POST incoming seo:", body.seo);
      console.log("[TEAM SEO DEBUG] POST incoming body.seo:", body.seo);
    }

    const parsed = teamMemberCreateSchema.safeParse(json);
    if (!parsed.success) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          "[TEAM DEBUG] POST validation failed:",
          parsed.error.flatten().fieldErrors
        );
      }
      return validationErrorResponse(parsed.error.flatten().fieldErrors);
    }
    const data = parsed.data;
    const slug = await ensureUniqueSlug(data.slug || data.name);

    const created = await TeamMember.create({
      ...data,
      slug,
      createdBy: new mongoose.Types.ObjectId(admin.id),
      updatedBy: new mongoose.Types.ObjectId(admin.id),
      publishedAt: data.status === "published" ? new Date() : undefined,
    });

    if (process.env.NODE_ENV === "development") {
      const saved = created.toObject() as unknown as Record<string, unknown>;
      console.log("[TEAM DEBUG] POST saved shortBio:", saved.shortBio);
      console.log("[TEAM DEBUG] POST saved expertise:", saved.expertise);
      console.log(
        "[TEAM DEBUG] POST saved qualifications:",
        saved.qualifications
      );
      console.log("[TEAM DEBUG] POST saved seo:", saved.seo);
      console.log("[TEAM SEO DEBUG] POST saved teamMember.seo:", saved.seo);
    }

    revalidatePath("/");
    revalidatePath("/careers");
    revalidatePath(`/team/${created.slug}`);

    return successResponse(
      "Team member created successfully.",
      { teamMember: serializeTeamMember(created.toObject()) },
      201
    );
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[POST /api/admin/team]", err);
    return errorResponse("Failed to create team member.");
  }
}
