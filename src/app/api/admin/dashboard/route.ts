import {
  successResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import { headers } from "next/headers";

/**
 * GET /api/admin/dashboard
 * Returns basic stats for the admin dashboard.
 * Protected by middleware (JWT cookie required).
 */
export async function GET() {
  try {
    // Admin identity is injected by middleware
    const headersList = await headers();
    const adminId = headersList.get("x-admin-id");

    if (!adminId) {
      return unauthorizedResponse();
    }

    // Placeholder — real stats will query MongoDB in Phase 2
    const stats = {
      services: 0,
      projects: 0,
      teamMembers: 0,
      newEnquiries: 0,
    };

    return successResponse("Dashboard stats retrieved.", stats);
  } catch (err) {
    console.error("[GET /api/admin/dashboard]", err);
    const { errorResponse } = await import("@/lib/api-response");
    return errorResponse("Failed to retrieve dashboard stats.");
  }
}
