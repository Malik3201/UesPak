import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { TeamMember } from "@/models/TeamMember";
import { requireAdmin, AdminAuthError } from "@/lib/auth";
import {
  errorResponse,
  notFoundResponse,
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { generateSlug } from "@/lib/slug";
import { teamMemberUpdateSchema } from "@/validators/team-member.validator";
import { serializeTeamMember } from "@/lib/team";

async function ensureUniqueSlug(
  base: string,
  excludeId?: string
): Promise<string> {
  let slug = generateSlug(base);
  if (!slug) slug = "team-member";
  let candidate = slug;
  let counter = 2;
  while (true) {
    const exists = await TeamMember.exists({
      slug: candidate,
      ...(excludeId
        ? { _id: { $ne: new mongoose.Types.ObjectId(excludeId) } }
        : {}),
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
      return errorResponse("Invalid team member ID.", 400);
    }

    const member = await TeamMember.findById(id).lean();
    if (!member) return notFoundResponse("Team member not found.");

    const serialized = serializeTeamMember(
      member as unknown as Record<string, unknown>
    );

    if (process.env.NODE_ENV === "development") {
      console.log("[TEAM DEBUG] GET team member id:", id);
      console.log("[TEAM DEBUG] GET seo:", serialized.seo);
      console.log("[TEAM SEO DEBUG] GET teamMember.seo:", serialized.seo);
      console.log("[TEAM DEBUG] GET expertise:", serialized.expertise);
      console.log(
        "[TEAM DEBUG] GET qualifications:",
        serialized.qualifications
      );
      console.log("[TEAM DEBUG] GET shortBio:", serialized.shortBio);
      console.log("[TEAM DEBUG] GET image:", serialized.image);
    }

    return successResponse("Team member loaded successfully.", {
      teamMember: serialized,
    });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[GET /api/admin/team/[id]]", err);
    return errorResponse("Failed to load team member.");
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
      return errorResponse("Invalid team member ID.", 400);
    }

    const existing = await TeamMember.findById(id);
    if (!existing) return notFoundResponse("Team member not found.");

    const json = await request.json().catch(() => null);
    if (!json || typeof json !== "object") {
      return errorResponse("Invalid request body.", 400);
    }

    if (process.env.NODE_ENV === "development") {
      const body = json as Record<string, unknown>;
      console.log("[TEAM DEBUG] PATCH incoming id:", id);
      console.log("[TEAM DEBUG] PATCH incoming shortBio:", body.shortBio);
      console.log("[TEAM DEBUG] PATCH incoming bio length:", typeof body.bio === "string" ? (body.bio as string).length : null);
      console.log("[TEAM DEBUG] PATCH incoming expertise:", body.expertise);
      console.log(
        "[TEAM DEBUG] PATCH incoming qualifications:",
        body.qualifications
      );
      console.log("[TEAM DEBUG] PATCH incoming email:", body.email);
      console.log(
        "[TEAM DEBUG] PATCH incoming experienceYears:",
        body.experienceYears
      );
      console.log("[TEAM DEBUG] PATCH incoming seo:", body.seo);
      console.log("[TEAM SEO DEBUG] API incoming body.seo:", body.seo);
      console.log("[TEAM DEBUG] PATCH incoming image:", body.image);
    }

    const parsed = teamMemberUpdateSchema.safeParse(json);
    if (!parsed.success) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          "[TEAM DEBUG] PATCH validation failed:",
          parsed.error.flatten().fieldErrors
        );
      }
      return validationErrorResponse(parsed.error.flatten().fieldErrors);
    }
    const data = parsed.data;

    if (process.env.NODE_ENV === "development") {
      console.log("[TEAM DEBUG] PATCH validated shortBio:", data.shortBio);
      console.log("[TEAM DEBUG] PATCH validated expertise:", data.expertise);
      console.log(
        "[TEAM DEBUG] PATCH validated qualifications:",
        data.qualifications
      );
      console.log("[TEAM DEBUG] PATCH validated seo:", data.seo);
      console.log("[TEAM SEO DEBUG] validated.seo:", data.seo);
    }

    const existingObject = existing.toObject() as {
      seo?: Record<string, unknown>;
    };
    const existingSeo = existingObject.seo ?? {};
    const incomingSeo = data.seo as Record<string, unknown> | undefined;

    // Merge incoming SEO over existing SEO so partial SEO patches don't wipe
    // previously saved SEO subfields. Arrays and booleans must be checked by
    // type, not truthiness, because empty keywords and false robots are valid.
    const mergedSeo =
      incomingSeo !== undefined
        ? {
            metaTitle:
              incomingSeo.metaTitle ?? existingSeo.metaTitle ?? "",
            metaDescription:
              incomingSeo.metaDescription ??
              existingSeo.metaDescription ??
              "",
            keywords: Array.isArray(incomingSeo.keywords)
              ? incomingSeo.keywords
              : Array.isArray(existingSeo.keywords)
                ? existingSeo.keywords
                : [],
            canonicalUrl:
              incomingSeo.canonicalUrl ?? existingSeo.canonicalUrl ?? "",
            ogTitle: incomingSeo.ogTitle ?? existingSeo.ogTitle ?? "",
            ogDescription:
              incomingSeo.ogDescription ?? existingSeo.ogDescription ?? "",
            ogImage: incomingSeo.ogImage ?? existingSeo.ogImage,
            robots: {
              index:
                (incomingSeo.robots as { index?: boolean } | undefined)
                  ?.index ??
                (existingSeo.robots as { index?: boolean } | undefined)
                  ?.index ??
                true,
              follow:
                (incomingSeo.robots as { follow?: boolean } | undefined)
                  ?.follow ??
                (existingSeo.robots as { follow?: boolean } | undefined)
                  ?.follow ??
                true,
            },
            schemaType:
              incomingSeo.schemaType ?? existingSeo.schemaType ?? "Person",
          }
        : undefined;

    const updatePayload: Record<string, unknown> = { ...data };
    if (mergedSeo !== undefined) {
      updatePayload.seo = mergedSeo;
    }

    if (data.slug || data.name) {
      const slugBase = data.slug || data.name || existing.name;
      updatePayload.slug = await ensureUniqueSlug(slugBase, id);
    }

    if (data.status === "published" && !existing.publishedAt) {
      updatePayload.publishedAt = new Date();
    }
    if (data.status && data.status !== "published") {
      updatePayload.publishedAt = undefined;
    }

    updatePayload.updatedBy = new mongoose.Types.ObjectId(admin.id);

    if (process.env.NODE_ENV === "development") {
      console.log(
        "[TEAM SEO DEBUG] updateData.seo before DB save:",
        updatePayload.seo
      );
      console.log(
        "[TEAM SEO DEBUG] full updateData keys:",
        Object.keys(updatePayload || {})
      );
    }

    // strict: false guards against silent field dropping if the Mongoose
    // model instance is stale due to Next.js HMR caching (same defense
    // pattern we used for HomePage CMS persistence).
    const updated = await TeamMember.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      {
        new: true,
        runValidators: true,
        strict: false,
      }
    ).lean();
    if (!updated) return notFoundResponse("Team member not found.");

    if (process.env.NODE_ENV === "development") {
      const saved = updated as unknown as Record<string, unknown>;
      console.log("[TEAM DEBUG] PATCH saved shortBio:", saved.shortBio);
      console.log("[TEAM DEBUG] PATCH saved expertise:", saved.expertise);
      console.log(
        "[TEAM DEBUG] PATCH saved qualifications:",
        saved.qualifications
      );
      console.log("[TEAM DEBUG] PATCH saved seo:", saved.seo);
      console.log("[TEAM SEO DEBUG] savedTeamMember.seo:", saved.seo);
      console.log("[TEAM DEBUG] PATCH saved image:", saved.image);
    }

    revalidatePath("/");
    revalidatePath("/careers");
    revalidatePath(`/team/${updated.slug}`);

    return successResponse("Team member updated successfully.", {
      teamMember: serializeTeamMember(
        updated as unknown as Record<string, unknown>
      ),
    });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[PATCH /api/admin/team/[id]]", err);
    return errorResponse("Failed to update team member.");
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
      return errorResponse("Invalid team member ID.", 400);
    }

    const archived = await TeamMember.findByIdAndUpdate(
      id,
      { status: "archived", publishedAt: undefined },
      { new: true }
    ).lean();
    if (!archived) return notFoundResponse("Team member not found.");

    revalidatePath("/");
    revalidatePath("/careers");
    revalidatePath(`/team/${archived.slug}`);

    return successResponse("Team member archived successfully.", {
      teamMember: serializeTeamMember(
        archived as unknown as Record<string, unknown>
      ),
    });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[DELETE /api/admin/team/[id]]", err);
    return errorResponse("Failed to archive team member.");
  }
}
