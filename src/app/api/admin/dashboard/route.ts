import {
  successResponse,
  unauthorizedResponse,
  errorResponse,
} from "@/lib/api-response";
import { getCurrentAdmin } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard";

/**
 * GET /api/admin/dashboard
 * Requires valid admin JWT + active user record.
 */
export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return unauthorizedResponse();

    const data = await getDashboardData();

    return successResponse("Dashboard stats retrieved.", {
      currentUser: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      counts: data.counts,
      contentStatus: data.contentStatus,
      enquiryTrend: data.enquiryTrend,
      recentEnquiries: data.recentEnquiries,
      recentServices: data.recentServices,
      recentProjects: data.recentProjects,
      recentJobs: data.recentJobs,
      launchReadiness: data.launchReadiness,
    });
  } catch (err) {
    console.error("[GET /api/admin/dashboard]", err);
    return errorResponse("Failed to retrieve dashboard stats.");
  }
}
