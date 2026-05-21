import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Redirect } from "@/models/Redirect";
import { requireAdmin, AdminAuthError } from "@/lib/auth";
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { redirectCreateSchema } from "@/validators/redirect.validator";
import {
  clearRedirectCache,
  getAdminRedirects,
  serializeRedirect,
  wouldCreateRedirectLoop,
} from "@/lib/redirects";
import type { IRedirect } from "@/models/Redirect";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const activeParam = searchParams.get("isActive");
    const isActive =
      activeParam === "true" ? true : activeParam === "false" ? false : undefined;
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);

    const result = await getAdminRedirects({ search, isActive, page, limit });
    return successResponse("Redirects loaded successfully.", result);
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[GET /api/admin/redirects]", err);
    return errorResponse("Failed to load redirects.");
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

    const parsed = redirectCreateSchema.safeParse(json);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.flatten().fieldErrors);
    }

    const data = parsed.data;
    const exists = await Redirect.exists({ fromPath: data.fromPath });
    if (exists) {
      return errorResponse("A redirect for this from path already exists.", 409);
    }

    if (await wouldCreateRedirectLoop(data.fromPath, data.toPath)) {
      return errorResponse("This redirect would create a loop.", 400);
    }

    const doc = await Redirect.create({
      ...data,
      hitCount: 0,
      createdBy: new mongoose.Types.ObjectId(admin.id),
      updatedBy: new mongoose.Types.ObjectId(admin.id),
    });

    clearRedirectCache();

    return successResponse(
      "Redirect created successfully.",
      { redirect: serializeRedirect(doc.toObject() as IRedirect & { _id: unknown }) },
      201
    );
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[POST /api/admin/redirects]", err);
    return errorResponse("Failed to create redirect.");
  }
}
