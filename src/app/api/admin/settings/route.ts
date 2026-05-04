import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { getCurrentAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { SITE_SETTINGS_DOCUMENT_KEY } from "@/constants/site-settings";
import {
  SiteSetting,
  siteSettingToDTO,
  type ISiteSetting,
} from "@/models/SiteSetting";
import type { SiteSettingsDTO } from "@/types/site-settings";
import {
  dtoToPublic,
  getDefaultSiteSettings,
  getSiteSettings,
} from "@/lib/site-settings";
import { mergeSiteSettingsPatchPayload } from "@/lib/site-settings-patch-merge";
import {
  siteSettingsSchema,
  type SiteSettingsInput,
} from "@/validators/settings.validator";

const LEGACY_KEY_GLOBAL = "global";

const LEGACY_FIELDS_UNSET = {
  phone: "",
  email: "",
  linkedIn: "",
  twitter: "",
  facebook: "",
  instagram: "",
  defaultSeo: "",
} as const;

function singletonFilter() {
  return {
    $or: [{ key: SITE_SETTINGS_DOCUMENT_KEY }, { key: LEGACY_KEY_GLOBAL }],
  };
}

function buildUpsertPayload(
  validated: SiteSettingsInput,
  adminId: string
): mongoose.UpdateQuery<ISiteSetting>["$set"] {
  return {
    key: SITE_SETTINGS_DOCUMENT_KEY,
    siteName: validated.siteName,
    tagline: validated.tagline ?? undefined,
    logo: validated.logo ?? undefined,
    darkLogo: validated.darkLogo ?? undefined,
    favicon: validated.favicon ?? undefined,
    phones: validated.phones ?? [],
    emails: validated.emails ?? [],
    address: validated.address ?? undefined,
    workingHours: validated.workingHours ?? undefined,
    mapEmbedUrl: validated.mapEmbedUrl ?? undefined,
    socialLinks: validated.socialLinks ?? [],
    profilePdf: validated.profilePdf ?? undefined,
    profileButtonText:
      validated.profileButtonText?.trim() || "Download Profile",
    footerText: validated.footerText ?? undefined,
    copyrightText: validated.copyrightText ?? undefined,
    footerDescription: validated.footerDescription ?? undefined,
    globalCTA: {
      ...validated.globalCTA,
      isActive: Boolean(validated.globalCTA?.isActive),
    },
    seo: {
      ...validated.seo,
      keywords: validated.seo?.keywords ?? [],
      robots:
        validated.seo?.robots ?? ({ index: true, follow: true } as const),
    },
    updatedBy: new mongoose.Types.ObjectId(adminId),
  } as mongoose.UpdateQuery<ISiteSetting>["$set"];
}

/** GET /api/admin/settings */
export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return unauthorizedResponse();

    await connectDB();
    const persisted =
      (await SiteSetting.findOne(singletonFilter()).select("_id").lean()) !==
      null;
    const dto = await getSiteSettings();

    return successResponse(
      persisted
        ? "Site settings retrieved."
        : "Using default settings — save to create the document.",
      {
        settings: dto,
        persisted,
        publicPreview: dtoToPublic(dto),
      }
    );
  } catch (err) {
    console.error("[GET /api/admin/settings]", err);
    const defaults = getDefaultSiteSettings();
    return successResponse("Using defaults after read error.", {
      settings: defaults,
      persisted: false,
      publicPreview: dtoToPublic(defaults),
    });
  }
}

/** PATCH /api/admin/settings — validated upsert merged with existing snapshot */
export async function PATCH(req: NextRequest) {
  const isDev = process.env.NODE_ENV === "development";

  try {
    const admin = await getCurrentAdmin();
    if (!admin) return unauthorizedResponse();

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return errorResponse("Invalid request body.", 400);
    }

    const sanitized = Object.fromEntries(
      Object.entries(body as Record<string, unknown>).filter(
        ([k]) => k !== "createdBy" && k !== "updatedBy"
      )
    ) as Record<string, unknown>;

    if (isDev) {
      console.log(
        "[PATCH /api/admin/settings] incoming keys:",
        Object.keys(sanitized)
      );
    }

    await connectDB();

    const rawExisting = await SiteSetting.findOne(singletonFilter()).lean<
      Record<string, unknown> | null
    >();

    const existingDto: SiteSettingsDTO = rawExisting
      ? siteSettingToDTO(rawExisting as Parameters<typeof siteSettingToDTO>[0])
      : getDefaultSiteSettings();

    const merged = mergeSiteSettingsPatchPayload(existingDto, sanitized);
    const parsed = siteSettingsSchema.safeParse(merged);

    if (!parsed.success) {
      if (isDev) {
        console.warn(
          "[PATCH /api/admin/settings] validation failed:",
          parsed.error.flatten()
        );
      }
      return validationErrorResponse(parsed.error.flatten().fieldErrors);
    }

    const existingForInsert = await SiteSetting.findOne(singletonFilter())
      .select("createdBy")
      .lean<{ createdBy?: mongoose.Types.ObjectId } | null>();

    const payload = buildUpsertPayload(parsed.data, admin.id);

    const adminOid = new mongoose.Types.ObjectId(admin.id);
    const update: mongoose.UpdateQuery<ISiteSetting> = {
      $set: payload,
      $unset: { ...LEGACY_FIELDS_UNSET },
    };
    if (!existingForInsert?.createdBy) {
      update.$setOnInsert = { createdBy: adminOid };
    }

    const updated = await SiteSetting.findOneAndUpdate(singletonFilter(), update, {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }).exec();

    if (!updated) {
      return errorResponse("Failed to save site settings.");
    }

    const dto = siteSettingToDTO(updated);

    if (isDev) {
      console.log(
        "[PATCH /api/admin/settings] saved key:",
        dto.key,
        "document id:",
        String(updated._id)
      );
    }

    return successResponse("Settings saved successfully.", {
      settings: dto,
      persisted: true,
      publicPreview: dtoToPublic(dto),
    });
  } catch (err) {
    console.error("[PATCH /api/admin/settings]", err);
    if (err instanceof mongoose.Error.ValidationError) {
      return errorResponse(err.message);
    }
    return errorResponse("Failed to save site settings.");
  }
}
