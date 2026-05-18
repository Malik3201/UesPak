import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { SeoSetting, seoSettingToDTO } from "@/models/SeoSetting";
import {
  DEFAULT_SEO_SETTINGS,
  SEO_SETTINGS_DOCUMENT_KEY,
} from "@/constants/seo-settings";
import { requireAdmin, AdminAuthError } from "@/lib/auth";
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { seoSettingUpdateSchema } from "@/validators/seo-setting.validator";
import { clearSeoSettingsCache } from "@/lib/seo-settings";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const doc = await SeoSetting.findOne({ key: SEO_SETTINGS_DOCUMENT_KEY }).lean();
    const settings = doc
      ? seoSettingToDTO(doc as Parameters<typeof seoSettingToDTO>[0])
      : { ...DEFAULT_SEO_SETTINGS };

    return successResponse("SEO settings loaded successfully.", { settings });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[GET /api/admin/seo]", err);
    return errorResponse("Failed to load SEO settings.");
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

    const parsed = seoSettingUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.flatten().fieldErrors);
    }

    const data = parsed.data;
    const payload = {
      ...data,
      key: SEO_SETTINGS_DOCUMENT_KEY,
      siteUrl: data.siteUrl || DEFAULT_SEO_SETTINGS.siteUrl,
      canonicalBaseUrl: data.canonicalBaseUrl || undefined,
      updatedBy: new mongoose.Types.ObjectId(admin.id),
    };

    const doc = await SeoSetting.findOneAndUpdate(
      { key: SEO_SETTINGS_DOCUMENT_KEY },
      payload,
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();

    clearSeoSettingsCache();

    revalidatePath("/");
    revalidatePath("/sitemap.xml");
    revalidatePath("/robots.txt");

    return successResponse("SEO settings saved successfully.", {
      settings: seoSettingToDTO(doc as Parameters<typeof seoSettingToDTO>[0]),
    });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[PATCH /api/admin/seo]", err);
    return errorResponse("Failed to save SEO settings.");
  }
}
