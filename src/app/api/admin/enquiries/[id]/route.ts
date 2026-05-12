import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAdmin, AdminAuthError } from "@/lib/auth";
import { ContactSubmission } from "@/models/ContactSubmission";
import type { ContactSubmissionStatus } from "@/models/ContactSubmission";
import { enquiryStatusUpdateSchema } from "@/validators/contact.validator";
import {
  errorResponse,
  notFoundResponse,
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/api-response";

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
    repliedAt: doc.repliedAt
      ? new Date(doc.repliedAt as Date).toISOString()
      : null,
    createdAt: doc.createdAt
      ? new Date(doc.createdAt as Date).toISOString()
      : null,
    updatedAt: doc.updatedAt
      ? new Date(doc.updatedAt as Date).toISOString()
      : null,
  };
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return notFoundResponse("Enquiry not found.");
    await connectDB();
    const doc = await ContactSubmission.findById(id).lean();
    if (!doc) return notFoundResponse("Enquiry not found.");
    return successResponse("Enquiry loaded successfully.", {
      enquiry: serializeSubmission(doc as unknown as Record<string, unknown>),
    });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[GET /api/admin/enquiries/[id]]", err);
    return errorResponse("Failed to load enquiry.");
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return notFoundResponse("Enquiry not found.");
    await connectDB();

    const json = await req.json().catch(() => null);
    const parsed = enquiryStatusUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.flatten().fieldErrors);
    }

    const update: Record<string, unknown> = { status: parsed.data.status };
    if (parsed.data.status === "replied") {
      update.repliedAt = new Date();
      update.repliedBy = new mongoose.Types.ObjectId(admin.id);
    }

    const updated = await ContactSubmission.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).lean();
    if (!updated) return notFoundResponse("Enquiry not found.");

    return successResponse("Enquiry updated.", {
      enquiry: serializeSubmission(
        updated as unknown as Record<string, unknown>
      ),
    });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[PATCH /api/admin/enquiries/[id]]", err);
    return errorResponse("Failed to update enquiry.");
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return notFoundResponse("Enquiry not found.");
    await connectDB();
    const result = await ContactSubmission.findByIdAndDelete(id).lean();
    if (!result) return notFoundResponse("Enquiry not found.");
    return successResponse("Enquiry deleted.", { id });
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorizedResponse();
    console.error("[DELETE /api/admin/enquiries/[id]]", err);
    return errorResponse("Failed to delete enquiry.");
  }
}
