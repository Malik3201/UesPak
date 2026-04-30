import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { ContactSubmission } from "@/models/ContactSubmission";
import { contactValidator } from "@/validators/contact.validator";
import { sendEmail, buildContactEmail } from "@/lib/email";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return errorResponse("Invalid request body.", 400);

    const parsed = contactValidator.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.flatten().fieldErrors);
    }

    const data = parsed.data;

    await connectDB();

    // Persist submission
    await ContactSubmission.create({
      ...data,
      ipAddress: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    // Send notification email (non-blocking failure)
    const receiverEmail =
      process.env.CONTACT_RECEIVER_EMAIL ?? "services@uespak.com";

    sendEmail({
      to: receiverEmail,
      subject: `New Enquiry: ${data.subject}`,
      html: buildContactEmail(data),
      replyTo: data.email,
    }).catch((err) => {
      console.error("[Contact] Failed to send notification email:", err);
    });

    return successResponse(
      "Thank you for your message. Our team will get back to you shortly.",
      null,
      201
    );
  } catch (err) {
    console.error("[POST /api/contact]", err);
    return errorResponse("An unexpected error occurred. Please try again.");
  }
}
