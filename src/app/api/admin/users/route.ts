import type { NextRequest } from "next/server";
import {
  requireSuperAdmin,
  AdminAuthError,
  AdminForbiddenError,
} from "@/lib/auth";
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { adminUserCreateSchema } from "@/validators/admin-user.validator";
import { createAdminUser, getAdminUsers } from "@/lib/admin-users";

export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const role = searchParams.get("role") as
      | "superAdmin"
      | "admin"
      | "editor"
      | "viewer"
      | undefined;
    const status = searchParams.get("status") as
      | "active"
      | "inactive"
      | "suspended"
      | undefined;
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);

    const result = await getAdminUsers({
      search,
      role: role || undefined,
      status: status || undefined,
      page,
      limit,
    });

    return successResponse("Admin users loaded successfully.", result);
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    if (err instanceof AdminForbiddenError) {
      return errorResponse(err.message, 403);
    }
    console.error("[GET /api/admin/users]", err);
    return errorResponse("Failed to load admin users.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireSuperAdmin();
    const json = await request.json().catch(() => null);
    if (!json || typeof json !== "object") {
      return errorResponse("Invalid request body.", 400);
    }

    const parsed = adminUserCreateSchema.safeParse(json);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.flatten().fieldErrors);
    }

    const data = parsed.data;
    const user = await createAdminUser(
      {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        status: data.status,
      },
      actor.id
    );

    return successResponse("Admin user created successfully.", { user }, 201);
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    if (err instanceof AdminForbiddenError) {
      return errorResponse(err.message, 403);
    }
    if (err instanceof Error && err.message.includes("already exists")) {
      return errorResponse(err.message, 409);
    }
    console.error("[POST /api/admin/users]", err);
    return errorResponse("Failed to create admin user.");
  }
}
