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
import { homePageSchema, homePageUpdateSchema } from "@/validators/home-page.validator";

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

function toSerializable(homePage: Record<string, unknown>) {
  const { _id, ...rest } = homePage;
  const hero = (rest.hero as Record<string, unknown>) || {};
  const normalized = {
    ...rest,
    hero: {
      ...hero,
      backgroundImages: (((hero.backgroundImages as unknown[]) || []) as Array<Record<string, unknown>>)
        .filter((item) => Boolean(item?.url && item?.publicId))
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

    return successResponse("Home page loaded successfully.", {
      homePage: toSerializable(merged as unknown as Record<string, unknown>),
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

    const partialParsed = homePageUpdateSchema.safeParse(json);
    if (!partialParsed.success) {
      return validationErrorResponse(partialParsed.error.flatten().fieldErrors);
    }

    const existing = await HomePage.findOne({ key: HOME_PAGE_KEY }).lean();
    const mergedRaw = mergeDeep(
      mergeDeep(getDefaultHomePageContent(), existing || {}),
      partialParsed.data
    );

    const parsed = homePageSchema.safeParse(mergedRaw);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.flatten().fieldErrors);
    }
    const data = parsed.data;
    const incomingHero = (partialParsed.data.hero as { backgroundImages?: unknown[] } | undefined);
    const incomingBackgroundCount = incomingHero?.backgroundImages?.length ?? 0;

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

    if (process.env.NODE_ENV !== "production") {
      console.info(
        "[PATCH /api/admin/home] hero.backgroundImages length (incoming -> parsed):",
        incomingBackgroundCount,
        "->",
        updatePayload.hero.backgroundImages?.length ?? 0
      );
    }

    const updated = await HomePage.findOneAndUpdate(
      { key: HOME_PAGE_KEY },
      {
        $set: updatePayload,
        $setOnInsert: { createdBy: new mongoose.Types.ObjectId(admin.id) },
      },
      { upsert: true, new: true }
    ).lean();

    revalidatePath("/");

    if (process.env.NODE_ENV !== "production") {
      const savedHero = (updated as unknown as { hero?: { backgroundImages?: unknown[] } })?.hero;
      console.info(
        "[PATCH /api/admin/home] hero.backgroundImages length (saved):",
        savedHero?.backgroundImages?.length ?? 0
      );
    }

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

