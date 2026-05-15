import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { requireAdmin, AdminAuthError } from "@/lib/auth";
import { PageContent } from "@/models/PageContent";
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
  notFoundResponse,
} from "@/lib/api-response";
import {
  PAGE_SLUGS,
  getDefaultPageContent,
} from "@/constants/page-content";
import type { PageKey } from "@/types/page-content";
import {
  getPageSchemaFor,
  isValidPageKey,
} from "@/validators/page-content.validator";

function mergeDeep<T>(base: T, incoming: unknown): T {
  if (incoming == null) return base;
  if (Array.isArray(base) || Array.isArray(incoming)) {
    return (incoming as T) ?? base;
  }
  if (typeof base !== "object" || typeof incoming !== "object") {
    return (incoming as T) ?? base;
  }
  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, val] of Object.entries(incoming as Record<string, unknown>)) {
    const current = result[key];
    if (Array.isArray(val)) {
      result[key] = [...val];
    } else if (
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

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function hasOwn(obj: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * For any section that may contain media or other carefully-managed nested
 * fields, ensure that when the incoming PATCH body OMITS those fields they
 * are not wiped by defaults. Saved values win; defaults are only used to
 * seed a fresh document.
 *
 * Order of precedence: incoming → existing → defaults.
 */
function preserveSectionMediaFields(
  mergedSections: Record<string, unknown>,
  defaultsSections: Record<string, unknown>,
  existingSections: Record<string, unknown>,
  incomingSections: Record<string, unknown>,
  sectionKey: string,
  fields: string[]
) {
  const merged = asRecord(mergedSections[sectionKey]);
  const defaults = asRecord(defaultsSections[sectionKey]);
  const existing = asRecord(existingSections[sectionKey]);
  const incoming = asRecord(incomingSections[sectionKey]);

  for (const field of fields) {
    if (hasOwn(incoming, field)) {
      merged[field] = incoming[field];
    } else if (hasOwn(existing, field)) {
      merged[field] = existing[field];
    } else if (hasOwn(defaults, field)) {
      merged[field] = defaults[field];
    }
  }
  mergedSections[sectionKey] = merged;
}

const MEDIA_FIELDS_BY_PAGE: Record<
  PageKey,
  Array<{ section: string; fields: string[] }>
> = {
  about: [
    { section: "overview", fields: ["image"] },
    { section: "story", fields: ["image", "badgeImage"] },
    { section: "cta", fields: ["backgroundImage"] },
  ],
  careers: [
    { section: "intro", fields: ["image"] },
    { section: "applyCTA", fields: ["backgroundImage"] },
  ],
  contact: [],
  services: [{ section: "cta", fields: ["backgroundImage"] }],
  projects: [{ section: "cta", fields: ["backgroundImage"] }],
};

function preservePageMedia(
  pageKey: PageKey,
  mergedRoot: Record<string, unknown>,
  defaultsRoot: Record<string, unknown>,
  existingRoot: Record<string, unknown>,
  incomingRoot: Record<string, unknown>
) {
  // Hero background image
  const mergedHero = asRecord(mergedRoot.hero);
  const defaultsHero = asRecord(defaultsRoot.hero);
  const existingHero = asRecord(existingRoot.hero);
  const incomingHero = asRecord(incomingRoot.hero);
  if (hasOwn(incomingHero, "backgroundImage")) {
    mergedHero.backgroundImage = incomingHero.backgroundImage;
  } else if (hasOwn(existingHero, "backgroundImage")) {
    mergedHero.backgroundImage = existingHero.backgroundImage;
  } else if (hasOwn(defaultsHero, "backgroundImage")) {
    mergedHero.backgroundImage = defaultsHero.backgroundImage;
  }
  if (hasOwn(incomingHero, "overlayOpacity")) {
    mergedHero.overlayOpacity = incomingHero.overlayOpacity;
  } else if (hasOwn(existingHero, "overlayOpacity")) {
    mergedHero.overlayOpacity = existingHero.overlayOpacity;
  } else if (hasOwn(defaultsHero, "overlayOpacity")) {
    mergedHero.overlayOpacity = defaultsHero.overlayOpacity;
  }
  mergedRoot.hero = mergedHero;

  // SEO og image
  const mergedSeo = asRecord(mergedRoot.seo);
  const defaultsSeo = asRecord(defaultsRoot.seo);
  const existingSeo = asRecord(existingRoot.seo);
  const incomingSeo = asRecord(incomingRoot.seo);
  if (hasOwn(incomingSeo, "ogImage")) {
    mergedSeo.ogImage = incomingSeo.ogImage;
  } else if (hasOwn(existingSeo, "ogImage")) {
    mergedSeo.ogImage = existingSeo.ogImage;
  } else if (hasOwn(defaultsSeo, "ogImage")) {
    mergedSeo.ogImage = defaultsSeo.ogImage;
  }
  mergedRoot.seo = mergedSeo;

  // Section-specific media fields
  const mergedSections = asRecord(mergedRoot.sections);
  const defaultsSections = asRecord(defaultsRoot.sections);
  const existingSections = asRecord(existingRoot.sections);
  const incomingSections = asRecord(incomingRoot.sections);
  for (const { section, fields } of MEDIA_FIELDS_BY_PAGE[pageKey] ?? []) {
    preserveSectionMediaFields(
      mergedSections,
      defaultsSections,
      existingSections,
      incomingSections,
      section,
      fields
    );
  }
  mergedRoot.sections = mergedSections;
}

function toSerializable(doc: Record<string, unknown>) {
  const { _id, __v, ...rest } = doc as Record<string, unknown> & {
    _id?: unknown;
    __v?: unknown;
  };
  void __v;
  return { id: _id ? String(_id) : undefined, ...rest };
}

interface RouteParams {
  params: Promise<{ pageKey: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { pageKey: rawKey } = await params;
    if (!isValidPageKey(rawKey)) {
      return notFoundResponse("Page not found.");
    }
    const pageKey = rawKey as PageKey;

    await connectDB();
    const existing = await PageContent.findOne({ pageKey }).lean();
    if (!existing) {
      return successResponse("Page loaded successfully.", {
        pageContent: getDefaultPageContent(pageKey),
        persisted: false,
      });
    }

    const merged = mergeDeep(
      getDefaultPageContent(pageKey),
      existing as unknown as Record<string, unknown>
    );

    return successResponse("Page loaded successfully.", {
      pageContent: toSerializable(merged as unknown as Record<string, unknown>),
      persisted: true,
    });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[GET /api/admin/pages/[pageKey]]", err);
    return errorResponse("Failed to load page.");
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAdmin();
    const { pageKey: rawKey } = await params;
    if (!isValidPageKey(rawKey)) {
      return notFoundResponse("Page not found.");
    }
    const pageKey = rawKey as PageKey;

    await connectDB();

    const json = await request.json().catch(() => null);
    if (!json || typeof json !== "object") {
      return errorResponse("Invalid request body.", 400);
    }
    const body = json as Record<string, unknown>;

    const existing = await PageContent.findOne({ pageKey }).lean();
    const defaults = getDefaultPageContent(pageKey);

    const mergedRaw = mergeDeep(
      mergeDeep(defaults, existing || {}),
      body
    ) as unknown as Record<string, unknown>;

    // Lock pageKey to the URL value — body cannot override.
    mergedRaw.pageKey = pageKey;
    mergedRaw.slug = PAGE_SLUGS[pageKey];

    preservePageMedia(
      pageKey,
      mergedRaw,
      defaults as unknown as Record<string, unknown>,
      asRecord(existing),
      body
    );

    const schema = getPageSchemaFor(pageKey);
    const parsed = schema.safeParse(mergedRaw);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.flatten().fieldErrors);
    }

    const updatePayload = {
      ...parsed.data,
      pageKey,
      slug: PAGE_SLUGS[pageKey],
      updatedBy: new mongoose.Types.ObjectId(admin.id),
    };

    const updated = await PageContent.findOneAndUpdate(
      { pageKey },
      {
        $set: updatePayload,
        $setOnInsert: { createdBy: new mongoose.Types.ObjectId(admin.id) },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        // Guards against stale schema cache stripping nested fields under HMR.
        strict: false,
      }
    ).lean();

    revalidatePath(PAGE_SLUGS[pageKey]);

    return successResponse("Page updated successfully.", {
      pageContent: updated
        ? toSerializable(updated as unknown as Record<string, unknown>)
        : parsed.data,
      persisted: true,
    });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[PATCH /api/admin/pages/[pageKey]]", err);
    return errorResponse("Failed to update page.");
  }
}
