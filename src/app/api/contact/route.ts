import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { ContactSubmission } from "@/models/ContactSubmission";
import { contactValidator } from "@/validators/contact.validator";
import {
  sendEmail,
  buildContactEmail,
  resolveEmailSiteUrl,
} from "@/lib/email";
import { getPublicSiteSettings } from "@/lib/site-settings";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/lib/api-response";

function toUndef(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return errorResponse("Invalid request body.", 400);

    const parsed = contactValidator.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.flatten().fieldErrors);
    }

    const data = parsed.data;

    // Honeypot: silent-success if a bot filled the hidden field.
    if (data.website && data.website.length > 0) {
      return successResponse(
        "Thank you for your message. Our team will get back to you shortly.",
        null,
        201
      );
    }

    await connectDB();

    const submission = await ContactSubmission.create({
      name: data.name,
      email: data.email,
      phone: toUndef(data.phone),
      company: toUndef(data.company),
      subject: data.subject,
      serviceInterest: toUndef(data.serviceInterest),
      message: data.message,
      consent: data.consent === true ? true : undefined,
      source: "contact-page",
      ipAddress:
        req.headers.get("x-forwarded-for") ??
        req.headers.get("x-real-ip") ??
        undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    // Non-blocking email notification.
    const receiverEmail =
      process.env.CONTACT_RECEIVER_EMAIL ?? "services@uespak.com";
    const publicSettings = await getPublicSiteSettings();
    const logoUrl =
      publicSettings.darkLogoUrl?.trim() || publicSettings.logoUrl?.trim();
    const emailContent = buildContactEmail({
      name: data.name,
      email: data.email,
      phone: toUndef(data.phone),
      company: toUndef(data.company),
      serviceInterest: toUndef(data.serviceInterest),
      subject: data.subject,
      message: data.message,
      source: "contact-page",
      submittedAt: new Date(),
      logoUrl,
      siteUrl: resolveEmailSiteUrl(),
    });

    sendEmail({
      to: receiverEmail,
      subject: `New Website Enquiry — ${data.subject}`,
      html: emailContent.html,
      text: emailContent.text,
      replyTo: data.email,
    }).catch((err) => {
      console.error("[Contact] Failed to send notification email:", err);
    });

    return successResponse(
      "Thank you for your message. Our team will get back to you shortly.",
      { id: String(submission._id) },
      201
    );
  } catch (err) {
    console.error("[POST /api/contact]", err);
    return errorResponse("An unexpected error occurred. Please try again.");
  }
}
