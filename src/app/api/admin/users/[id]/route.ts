import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import {
  requireSuperAdmin,
  AdminAuthError,
  AdminForbiddenError,
} from "@/lib/auth";
import {
  errorResponse,
  notFoundResponse,
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { adminUserUpdateSchema } from "@/validators/admin-user.validator";
import {
  countActiveSuperAdmins,
  deactivateAdminUser,
  getAdminUserById,
  updateAdminUser,
} from "@/lib/admin-users";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return errorResponse("Invalid user ID.", 400);
    }

    const user = await getAdminUserById(id);
    if (!user) return notFoundResponse("Admin user not found.");

    return successResponse("Admin user loaded successfully.", { user });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    if (err instanceof AdminForbiddenError) {
      return errorResponse(err.message, 403);
    }
    console.error("[GET /api/admin/users/[id]]", err);
    return errorResponse("Failed to load admin user.");
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireSuperAdmin();
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return errorResponse("Invalid user ID.", 400);
    }

    const existing = await getAdminUserById(id);
    if (!existing) return notFoundResponse("Admin user not found.");

    const json = await request.json().catch(() => null);
    if (!json || typeof json !== "object") {
      return errorResponse("Invalid request body.", 400);
    }

    const parsed = adminUserUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.flatten().fieldErrors);
    }

    const data = parsed.data;
    const nextRole = data.role ?? existing.role;
    const nextStatus = data.status ?? existing.status;

    if (
      existing.role === "superAdmin" &&
      (nextStatus !== "active" || nextRole !== "superAdmin")
    ) {
      const superCount = await countActiveSuperAdmins(id);
      if (superCount === 0) {
        return errorResponse(
          "Cannot change role or disable the last active super admin.",
          400
        );
      }
    }

    if (id === actor.id && nextStatus !== "active") {
      return errorResponse("You cannot disable your own account.", 400);
    }

    const user = await updateAdminUser(
      id,
      {
        name: data.name,
        email: data.email,
        password: data.password?.trim() || undefined,
        role: data.role,
        status: data.status,
      },
      actor.id
    );

    return successResponse("Admin user updated successfully.", { user });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    if (err instanceof AdminForbiddenError) {
      return errorResponse(err.message, 403);
    }
    if (err instanceof Error && err.message.includes("already exists")) {
      return errorResponse(err.message, 409);
    }
    console.error("[PATCH /api/admin/users/[id]]", err);
    return errorResponse("Failed to update admin user.");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireSuperAdmin();
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return errorResponse("Invalid user ID.", 400);
    }

    const existing = await getAdminUserById(id);
    if (!existing) return notFoundResponse("Admin user not found.");

    if (id === actor.id) {
      return errorResponse("You cannot disable your own account.", 400);
    }

    if (existing.role === "superAdmin" && existing.status === "active") {
      const superCount = await countActiveSuperAdmins(id);
      if (superCount === 0) {
        return errorResponse("Cannot disable the last active super admin.", 400);
      }
    }

    await deactivateAdminUser(id, actor.id);

    return successResponse("Admin user disabled successfully.");
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    if (err instanceof AdminForbiddenError) {
      return errorResponse(err.message, 403);
    }
    console.error("[DELETE /api/admin/users/[id]]", err);
    return errorResponse("Failed to disable admin user.");
  }
}
