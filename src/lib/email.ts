import nodemailer from "nodemailer";

// ─── Transport ─────────────────────────────────────────────────────────────────
function createTransport() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT ?? 587),
    secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for others
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
  replyTo?: string;
}

// ─── Helper ────────────────────────────────────────────────────────────────────
/**
 * Generic email sender. Creates a new transport per call to support
 * serverless environments where long-lived connections are not ideal.
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const transport = createTransport();

  await transport.sendMail({
    from: process.env.EMAIL_FROM ?? '"UESPAK" <noreply@uespak.com>',
    to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
    subject: options.subject,
    html: options.html,
    ...(options.replyTo && { replyTo: options.replyTo }),
  });
}

// ─── Contact form email template ───────────────────────────────────────────────
export interface ContactEmailData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export function buildContactEmail(data: ContactEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#0f2a4e;padding:32px 40px;">
              <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">New Contact Enquiry</h1>
              <p style="color:#a8c4e0;margin:4px 0 0;font-size:14px;">UESPAK Website – Contact Form Submission</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
                    <span style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Full Name</span>
                    <p style="margin:4px 0 0;font-size:16px;color:#1a1a1a;font-weight:600;">${data.name}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
                    <span style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Email Address</span>
                    <p style="margin:4px 0 0;font-size:16px;color:#1a1a1a;">
                      <a href="mailto:${data.email}" style="color:#0f2a4e;text-decoration:none;">${data.email}</a>
                    </p>
                  </td>
                </tr>
                ${
                  data.phone
                    ? `<tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
                    <span style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Phone</span>
                    <p style="margin:4px 0 0;font-size:16px;color:#1a1a1a;">${data.phone}</p>
                  </td>
                </tr>`
                    : ""
                }
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
                    <span style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Subject</span>
                    <p style="margin:4px 0 0;font-size:16px;color:#1a1a1a;font-weight:600;">${data.subject}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">
                    <span style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Message</span>
                    <p style="margin:8px 0 0;font-size:15px;color:#333;line-height:1.6;white-space:pre-wrap;">${data.message}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#f9f9f9;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#aaa;">© ${new Date().getFullYear()} UESPAK. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
