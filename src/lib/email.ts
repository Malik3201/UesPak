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
  /** UESPAK dark logo URL from site settings (for green header). */
  darkLogoUrl?: string;
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
      <td class="detail-cell" style="padding:14px 18px;border-bottom:1px solid ${BRAND.mintBorder};vertical-align:top;">
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

  const darkLogo = data.darkLogoUrl?.trim();
  const logoBlock = darkLogo
    ? `<img src="${escapeHtml(darkLogo)}" alt="UESPAK" width="160" class="logo-img" style="display:block;width:160px;max-width:100%;height:auto;border:0;" />`
    : `<p style="margin:0;font-size:28px;font-weight:800;letter-spacing:0.04em;color:${BRAND.white};">UESPAK</p>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>New Website Enquiry</title>
  <style type="text/css">
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    a { text-decoration: none; }
    @media only screen and (max-width: 620px) {
      .email-shell { padding: 12px 8px !important; }
      .email-card { border-radius: 14px !important; }
      .email-pad { padding-left: 16px !important; padding-right: 16px !important; }
      .header-pad { padding: 22px 16px 20px !important; }
      .header-title { font-size: 20px !important; }
      .logo-img { width: 130px !important; max-width: 130px !important; }
      .detail-cell { padding: 12px 14px !important; }
      .message-pad { padding: 0 16px 20px !important; }
      .actions-pad { padding: 0 16px 24px !important; }
      .btn-row .btn-col-left { padding-right: 4px !important; width: 50% !important; }
      .btn-row .btn-col-right { padding-left: 4px !important; width: 50% !important; }
      .btn-link { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; text-align: center !important; font-size: 12px !important; line-height: 1.35 !important; padding: 11px 8px !important; }
      .footer-pad { padding: 18px 16px !important; }
    }
    @media only screen and (min-width: 621px) {
      .btn-row .btn-col-left { width: 50% !important; padding-right: 6px !important; }
      .btn-row .btn-col-right { width: 50% !important; padding-left: 6px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#eef2f0;font-family:Arial,Helvetica,sans-serif;color:${BRAND.text};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="email-shell" style="background:#eef2f0;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="email-card" style="max-width:680px;width:100%;background:${BRAND.white};border-radius:18px;overflow:hidden;border:1px solid #e2e8e4;box-shadow:0 8px 28px rgba(6,78,59,0.08);">
          <tr>
            <td class="header-pad" style="background:linear-gradient(135deg, ${BRAND.green} 0%, ${BRAND.greenDark} 100%);padding:28px 32px 24px;">
              ${logoBlock}
              <p class="header-title" style="margin:18px 0 6px;font-size:22px;font-weight:700;line-height:1.3;color:${BRAND.white};">New Website Enquiry</p>
              <p style="margin:0;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.88);">A new enquiry has been submitted from the UESPAK website.</p>
            </td>
          </tr>
          <tr>
            <td class="email-pad" style="padding:24px 32px 24px;">
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
            <td class="message-pad email-pad" style="padding:0 32px 24px;">
              <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.muted};">Message</p>
              <div style="background:#f8faf9;border:1px solid ${BRAND.mintBorder};border-radius:12px;padding:18px 20px;">
                <p style="margin:0;font-size:15px;line-height:1.7;color:${BRAND.text};word-break:break-word;">${formatMessageHtml(data.message)}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td class="actions-pad email-pad" style="padding:0 32px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="btn-row">
                <tr>
                  <td class="btn-col btn-col-left" width="50%" valign="top" style="padding-right:6px;">
                    <a href="${mailtoHref}" class="btn-link" style="display:block;width:100%;box-sizing:border-box;background:${BRAND.green};color:${BRAND.white};text-decoration:none;font-size:14px;font-weight:700;padding:13px 16px;border-radius:10px;text-align:center;">Reply by Email</a>
                  </td>
                  <td class="btn-col btn-col-right" width="50%" valign="top" style="padding-left:6px;">
                    <a href="${escapeHtml(adminUrl)}" class="btn-link" style="display:block;width:100%;box-sizing:border-box;background:${BRAND.white};color:${BRAND.green};text-decoration:none;font-size:14px;font-weight:700;padding:12px 16px;border-radius:10px;border:2px solid ${BRAND.green};text-align:center;">Open Admin Enquiries</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="footer-pad" style="background:#f8faf9;border-top:1px solid ${BRAND.mintBorder};padding:22px 32px;text-align:center;">
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
