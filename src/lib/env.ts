import { z } from "zod";

// ─── Schema ────────────────────────────────────────────────────────────────────
const envSchema = z.object({
  // App
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  // MongoDB
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  // Auth
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z
    .string()
    .min(1, "CLOUDINARY_API_SECRET is required"),

  // Email
  EMAIL_HOST: z.string().min(1, "EMAIL_HOST is required"),
  EMAIL_PORT: z.coerce.number().int().positive().default(587),
  EMAIL_USER: z.string().min(1, "EMAIL_USER is required"),
  EMAIL_PASS: z.string().min(1, "EMAIL_PASS is required"),
  EMAIL_FROM: z.string().min(1, "EMAIL_FROM is required"),
  CONTACT_RECEIVER_EMAIL: z
    .string()
    .email("CONTACT_RECEIVER_EMAIL must be a valid email"),

  // Revalidation
  REVALIDATE_SECRET: z.string().min(1, "REVALIDATE_SECRET is required"),
});

// ─── Parse & export ────────────────────────────────────────────────────────────
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  const missing = _env.error.issues
    .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
    .join("\n");

  // In development, only warn; in production, crash hard
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      `[UESPAK] Missing or invalid environment variables:\n${missing}\n\nPlease check your deployment env configuration.`
    );
  } else {
    console.warn(
      `[UESPAK] Environment variable warnings (some features may not work):\n${missing}`
    );
  }
}

// Export with fallbacks so the app doesn't crash at import time during dev
export const env = (_env.success ? _env.data : process.env) as z.infer<
  typeof envSchema
>;
