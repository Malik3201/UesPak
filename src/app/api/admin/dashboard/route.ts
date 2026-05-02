import {
  successResponse,
  unauthorizedResponse,
  errorResponse,
} from "@/lib/api-response";
import { getCurrentAdmin } from "@/lib/auth";

/**
 * GET /api/admin/dashboard
 * Requires valid admin JWT + active user record.
 */
export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return unauthorizedResponse();

    return successResponse("Dashboard stats retrieved.", {
      currentUser: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      stats: {
        services: 0,
        projects: 0,
        teamMembers: 0,
        enquiries: 0,
      },
    });
  } catch (err) {
    console.error("[GET /api/admin/dashboard]", err);
    return errorResponse("Failed to retrieve dashboard stats.");
  }
}
