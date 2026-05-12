import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { requireAdmin, AdminAuthError } from "@/lib/auth";
import { HomePage } from "@/models/HomePage";
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { HOME_PAGE_KEY, getDefaultHomePageContent } from "@/constants/home-page";
import { homePageSchema } from "@/validators/home-page.validator";

function mergeDeep<T>(base: T, incoming: unknown): T {
  if (incoming == null) return base;
  if (Array.isArray(base) || Array.isArray(incoming)) return (incoming as T) ?? base;
  if (typeof base !== "object" || typeof incoming !== "object") return (incoming as T) ?? base;

  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, val] of Object.entries(incoming as Record<string, unknown>)) {
    const current = result[key];
    if (Array.isArray(val)) result[key] = [...val];
    else if (
      val &&
      typeof val === "object" &&
      current &&
      typeof current === "object" &&
      !Array.isArray(current)
    ) {
      result[key] = mergeDeep(current, val);
    } else {
      result[key] = val;
    }
  }
  return result as T;
}

function isPresentMediaItem(item: Record<string, unknown>) {
  const url = item?.url;
  return Boolean(url);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function hasOwn(value: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function preserveNestedSectionFields(
  merged: Record<string, unknown>,
  defaults: Record<string, unknown>,
  existing: Record<string, unknown>,
  incoming: Record<string, unknown>,
  sectionKey: string,
  fields: string[]
) {
  const mergedSection = asRecord(merged[sectionKey]);
  const defaultSection = asRecord(defaults[sectionKey]);
  const existingSection = asRecord(existing[sectionKey]);
  const incomingSection = asRecord(incoming[sectionKey]);

  for (const field of fields) {
    if (hasOwn(incomingSection, field)) {
      mergedSection[field] = incomingSection[field];
    } else if (hasOwn(existingSection, field)) {
      mergedSection[field] = existingSection[field];
    } else if (hasOwn(defaultSection, field)) {
      mergedSection[field] = defaultSection[field];
    }
  }

  merged[sectionKey] = mergedSection;
}

function toSerializable(homePage: Record<string, unknown>) {
  const { _id, ...rest } = homePage;
  const hero = (rest.hero as Record<string, unknown>) || {};
  const normalized = {
    ...rest,
    hero: {
      ...hero,
      backgroundImages: (((hero.backgroundImages as unknown[]) || []) as Array<Record<string, unknown>>)
        .filter((item) => isPresentMediaItem(item))
        .map((item) => ({ ...item })),
    },
    featuredServices: {
      ...((rest.featuredServices as Record<string, unknown>) || {}),
      serviceIds: (
        (((rest.featuredServices as Record<string, unknown>)?.serviceIds as unknown[]) || [])
      ).map((id) => String(id)),
    },
    featuredProjects: {
      ...((rest.featuredProjects as Record<string, unknown>) || {}),
      projectIds: (
        (((rest.featuredProjects as Record<string, unknown>)?.projectIds as unknown[]) || [])
      ).map((id) => String(id)),
    },
  };
  return { id: String(_id), ...normalized };
}

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const existing = await HomePage.findOne({ key: HOME_PAGE_KEY }).lean();
    if (!existing) {
      return successResponse("Home page loaded successfully.", {
        homePage: getDefaultHomePageContent(),
        persisted: false,
      });
    }

    const merged = mergeDeep(
      getDefaultHomePageContent(),
      existing as unknown as Record<string, unknown>
    );

    const serializable = toSerializable(merged as unknown as Record<string, unknown>);

    if (process.env.NODE_ENV === "development") {
      const vm = (serializable as { visionMission?: Record<string, unknown> })
        .visionMission;
      console.log(
        "[VISION VIDEO DEBUG] API GET visionMission.video:",
        vm?.video
      );
      console.log(
        "[VISION VIDEO DEBUG] API GET visionMission.videoPoster:",
        vm?.videoPoster
      );
    }

    return successResponse("Home page loaded successfully.", {
      homePage: serializable,
      persisted: true,
    });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[GET /api/admin/home]", err);
    return errorResponse("Failed to load home page.");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    await connectDB();

    const json = await request.json().catch(() => null);
    if (!json || typeof json !== "object") {
      return errorResponse("Invalid request body.", 400);
    }

    const body = json as Record<string, unknown>;

    if (process.env.NODE_ENV === "development") {
      const incomingVm = (body as { visionMission?: Record<string, unknown> })
        .visionMission;
      console.log(
        "[VISION VIDEO DEBUG] API incoming body.visionMission.video:",
        incomingVm?.video
      );
      console.log(
        "[VISION VIDEO DEBUG] API incoming body.visionMission.videoPoster:",
        incomingVm?.videoPoster
      );
      console.log(
        "[VISION VIDEO DEBUG] API incoming body.visionMission.image:",
        incomingVm?.image
      );
    }

    const existing = await HomePage.findOne({ key: HOME_PAGE_KEY }).lean();
    const defaults = getDefaultHomePageContent();
    const mergedRaw = mergeDeep(
      mergeDeep(defaults, existing || {}),
      body
    ) as unknown as Record<string, unknown>;

    const existingRecord = asRecord(existing);
    const defaultsRecord = defaults as unknown as Record<string, unknown>;
    preserveNestedSectionFields(mergedRaw, defaultsRecord, existingRecord, body, "stats", [
      "backgroundImage",
      "overlayOpacity",
    ]);
    preserveNestedSectionFields(mergedRaw, defaultsRecord, existingRecord, body, "industries", [
      "backgroundImage",
      "overlayOpacity",
    ]);
    preserveNestedSectionFields(mergedRaw, defaultsRecord, existingRecord, body, "profileCTA", [
      "backgroundImage",
      "profilePdf",
    ]);
    preserveNestedSectionFields(mergedRaw, defaultsRecord, existingRecord, body, "contactCTA", [
      "backgroundImage",
      "cardBackgroundImage",
      "cardOverlayOpacity",
      "overlayOpacity",
    ]);

    const parsed = homePageSchema.safeParse(mergedRaw);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.flatten().fieldErrors);
    }
    const data = parsed.data;

    const updatePayload = {
      ...data,
      key: HOME_PAGE_KEY,
      featuredServices: {
        ...data.featuredServices,
        serviceIds: (data.featuredServices.serviceIds || []).map(
          (id) => new mongoose.Types.ObjectId(id)
        ),
      },
      featuredProjects: {
        ...data.featuredProjects,
        projectIds: (data.featuredProjects.projectIds || []).map(
          (id) => new mongoose.Types.ObjectId(id)
        ),
      },
      updatedBy: new mongoose.Types.ObjectId(admin.id),
    };

    const updated = await HomePage.findOneAndUpdate(
      { key: HOME_PAGE_KEY },
      {
        $set: updatePayload,
        $setOnInsert: { createdBy: new mongoose.Types.ObjectId(admin.id) },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        // strict:false guards against any stale Mongoose model cache (e.g. across
        // Next.js HMR) silently stripping nested paths that exist in the latest
        // schema but not in the cached model instance.
        strict: false,
      }
    ).lean();

    if (process.env.NODE_ENV === "development") {
      const savedVm = (updated as { visionMission?: Record<string, unknown> } | null)
        ?.visionMission;
      console.log(
        "[VISION VIDEO DEBUG] API saved homePage.visionMission.video:",
        savedVm?.video
      );
      console.log(
        "[VISION VIDEO DEBUG] API saved homePage.visionMission.videoPoster:",
        savedVm?.videoPoster
      );
    }

    revalidatePath("/");

    return successResponse("Home page updated successfully.", {
      homePage: updated
        ? toSerializable(updated as unknown as Record<string, unknown>)
        : data,
      persisted: true,
    });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[PATCH /api/admin/home]", err);
    return errorResponse("Failed to update home page.");
  }
}

