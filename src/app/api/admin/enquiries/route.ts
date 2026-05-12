import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin, AdminAuthError } from "@/lib/auth";
import { ContactSubmission } from "@/models/ContactSubmission";
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import type { ContactSubmissionStatus } from "@/models/ContactSubmission";

const ALLOWED_STATUSES: ContactSubmissionStatus[] = [
  "new",
  "read",
  "replied",
  "archived",
];

function serializeSubmission(doc: Record<string, unknown>) {
  return {
    id: String(doc._id),
    name: doc.name ?? "",
    email: doc.email ?? "",
    phone: (doc.phone as string | undefined) ?? "",
    company: (doc.company as string | undefined) ?? "",
    subject: doc.subject ?? "",
    serviceInterest: (doc.serviceInterest as string | undefined) ?? "",
    message: doc.message ?? "",
    status: (doc.status as ContactSubmissionStatus) ?? "new",
    source: (doc.source as string | undefined) ?? "contact-page",
    ipAddress: (doc.ipAddress as string | undefined) ?? "",
    userAgent: (doc.userAgent as string | undefined) ?? "",
    repliedAt: doc.repliedAt ? new Date(doc.repliedAt as Date).toISOString() : null,
    createdAt: doc.createdAt
      ? new Date(doc.createdAt as Date).toISOString()
      : null,
    updatedAt: doc.updatedAt
      ? new Date(doc.updatedAt as Date).toISOString()
      : null,
  };
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const url = new URL(request.url);
    const statusParam = url.searchParams.get("status")?.toLowerCase();
    const search = url.searchParams.get("search")?.trim();
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const limit = Math.min(
      100,
      Math.max(1, Number(url.searchParams.get("limit") || 25))
    );

    const filter: Record<string, unknown> = {};
    if (statusParam && ALLOWED_STATUSES.includes(statusParam as ContactSubmissionStatus)) {
      filter.status = statusParam;
    }
    if (search) {
      const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rx = new RegExp(safe, "i");
      filter.$or = [
        { name: rx },
        { email: rx },
        { subject: rx },
        { company: rx },
        { message: rx },
      ];
    }

    const [items, total, statusCounts] = await Promise.all([
      ContactSubmission.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ContactSubmission.countDocuments(filter),
      ContactSubmission.aggregate<{ _id: ContactSubmissionStatus; count: number }>(
        [{ $group: { _id: "$status", count: { $sum: 1 } } }]
      ),
    ]);

    const counts: Record<ContactSubmissionStatus, number> = {
      new: 0,
      read: 0,
      replied: 0,
      archived: 0,
    };
    for (const row of statusCounts) {
      if (row._id && row._id in counts) counts[row._id] = row.count;
    }

    return successResponse("Enquiries loaded successfully.", {
      enquiries: items.map((d) =>
        serializeSubmission(d as unknown as Record<string, unknown>)
      ),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      counts,
    });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[GET /api/admin/enquiries]", err);
    return errorResponse("Failed to load enquiries.");
  }
}
