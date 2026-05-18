import nodemailer from "nodemailer";

// ─── Transport ─────────────────────────────────────────────────────────────────
function createTransport() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT ?? 587),
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface ContactEmailData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  serviceInterest?: string;
  subject: string;
  message: string;
  source?: string;
  submittedAt?: Date;
  logoUrl?: string;
  siteUrl?: string;
}

export interface ContactEmailContent {
  html: string;
  text: string;
}

const BRAND = {
  green: "#064E3B",
  greenDark: "#043d2e",
  mint: "#f0f9f4",
  mintBorder: "#d1e7dd",
  text: "#1e293b",
  muted: "#64748b",
  white: "#ffffff",
} as const;

// ─── Helpers ───────────────────────────────────────────────────────────────────
export function resolveEmailSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "https://ues-pak.vercel.app";
  return raw.replace(/\/$/, "");
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMessageHtml(message: string): string {
  return escapeHtml(message).replace(/\r\n/g, "\n").replace(/\n/g, "<br />");
}

export function formatEnquiryDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function displayValue(value: string | undefined, fallback = "—"): string {
  const trimmed = value?.trim();
  return trimmed ? escapeHtml(trimmed) : fallback;
}

function isValidReplyToEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function detailRow(label: string, valueHtml: string): string {
  return `
    <tr>
      <td style="padding:14px 18px;border-bottom:1px solid ${BRAND.mintBorder};vertical-align:top;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.muted};">${escapeHtml(label)}</p>
        <p style="margin:0;font-size:15px;line-height:1.5;color:${BRAND.text};font-weight:500;">${valueHtml}</p>
      </td>
    </tr>`;
}

// ─── Sender ────────────────────────────────────────────────────────────────────
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const transport = createTransport();

  await transport.sendMail({
    from: process.env.EMAIL_FROM ?? '"UESPAK" <noreply@uespak.com>',
    to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
    subject: options.subject,
    html: options.html,
    ...(options.text ? { text: options.text } : {}),
    ...(options.replyTo && isValidReplyToEmail(options.replyTo)
      ? { replyTo: options.replyTo.trim() }
      : {}),
  });
}

// ─── Contact enquiry template ──────────────────────────────────────────────────
export function buildContactEmail(data: ContactEmailData): ContactEmailContent {
  const siteUrl = (data.siteUrl || resolveEmailSiteUrl()).replace(/\/$/, "");
  const submittedAt = data.submittedAt ?? new Date();
  const submittedLabel = formatEnquiryDate(submittedAt);
  const adminUrl = `${siteUrl}/admin/enquiries`;
  const safeEmail = escapeHtml(data.email);
  const mailtoHref = `mailto:${encodeURIComponent(data.email.trim())}`;
  const source = data.source?.trim() || "contact-page";

  const logoBlock = data.logoUrl?.trim()
    ? `<img src="${escapeHtml(data.logoUrl.trim())}" alt="UESPAK" width="140" style="display:block;width:140px;max-width:140px;height:auto;border:0;" />`
    : `<p style="margin:0;font-size:28px;font-weight:800;letter-spacing:0.04em;color:${BRAND.white};">UESPAK</p>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Website Enquiry</title>
</head>
<body style="margin:0;padding:0;background:#eef2f0;font-family:Arial,Helvetica,sans-serif;color:${BRAND.text};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f0;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;width:100%;background:${BRAND.white};border-radius:18px;overflow:hidden;border:1px solid #e2e8e4;box-shadow:0 8px 28px rgba(6,78,59,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg, ${BRAND.green} 0%, ${BRAND.greenDark} 100%);padding:28px 32px 24px;">
              ${logoBlock}
              <p style="margin:18px 0 6px;font-size:22px;font-weight:700;line-height:1.3;color:${BRAND.white};">New Website Enquiry</p>
              <p style="margin:0;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.88);">A new enquiry has been submitted from the UESPAK website.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 8px;background:${BRAND.white};">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:${BRAND.mint};border:1px solid ${BRAND.mintBorder};border-radius:999px;padding:8px 14px;">
                    <span style="font-size:12px;font-weight:700;color:${BRAND.green};letter-spacing:0.04em;">NEW ENQUIRY</span>
                  </td>
                  <td style="padding-left:12px;">
                    <span style="font-size:13px;color:${BRAND.muted};">Submitted ${escapeHtml(submittedLabel)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.mint};border:1px solid ${BRAND.mintBorder};border-radius:14px;overflow:hidden;">
                ${detailRow("Name", `<strong>${escapeHtml(data.name)}</strong>`)}
                ${detailRow("Email", `<a href="${mailtoHref}" style="color:${BRAND.green};text-decoration:none;">${safeEmail}</a>`)}
                ${detailRow("Phone", displayValue(data.phone))}
                ${detailRow("Company", displayValue(data.company))}
                ${detailRow("Service Interest", displayValue(data.serviceInterest))}
                ${detailRow("Subject", `<strong>${escapeHtml(data.subject)}</strong>`)}
                ${detailRow("Submitted At", escapeHtml(submittedLabel))}
                ${detailRow("Source", escapeHtml(source))}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px;">
              <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.muted};">Message</p>
              <div style="background:#f8faf9;border:1px solid ${BRAND.mintBorder};border-radius:12px;padding:18px 20px;">
                <p style="margin:0;font-size:15px;line-height:1.7;color:${BRAND.text};">${formatMessageHtml(data.message)}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding-bottom:10px;">
                    <a href="${mailtoHref}" style="display:inline-block;background:${BRAND.green};color:${BRAND.white};text-decoration:none;font-size:14px;font-weight:700;padding:13px 22px;border-radius:10px;">Reply by Email</a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <a href="${escapeHtml(adminUrl)}" style="display:inline-block;background:${BRAND.white};color:${BRAND.green};text-decoration:none;font-size:14px;font-weight:700;padding:12px 20px;border-radius:10px;border:2px solid ${BRAND.green};">Open Admin Enquiries</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#f8faf9;border-top:1px solid ${BRAND.mintBorder};padding:22px 32px;text-align:center;">
              <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:${BRAND.green};">UESPAK</p>
              <p style="margin:0 0 10px;font-size:12px;line-height:1.6;color:${BRAND.muted};">This notification was generated from the UESPAK website contact form.</p>
              <a href="${escapeHtml(siteUrl)}" style="font-size:12px;color:${BRAND.green};text-decoration:none;font-weight:600;">${escapeHtml(siteUrl)}</a>
              <p style="margin:14px 0 0;font-size:11px;color:#94a3b8;">© ${new Date().getFullYear()} UESPAK. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    "NEW WEBSITE ENQUIRY",
    "===================",
    "",
    "A new enquiry has been submitted from the UESPAK website.",
    "",
    `Submitted: ${submittedLabel}`,
    "",
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone?.trim() || "—"}`,
    `Company: ${data.company?.trim() || "—"}`,
    `Service Interest: ${data.serviceInterest?.trim() || "—"}`,
    `Subject: ${data.subject}`,
    `Source: ${source}`,
    "",
    "Message:",
    "--------",
    data.message,
    "",
    `Reply: mailto:${data.email.trim()}`,
    `Admin: ${adminUrl}`,
    `Website: ${siteUrl}`,
    "",
    `© ${new Date().getFullYear()} UESPAK`,
  ].join("\n");

  return { html, text };
}
