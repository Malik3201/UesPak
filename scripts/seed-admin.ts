/**
 * Creates the initial super-admin when none exists at the seed email.
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { connectDB } from "../src/lib/db";
import { hashPassword } from "../src/lib/password";
import { AdminUser } from "../src/models/AdminUser";

loadEnv({ path: resolve(process.cwd(), ".env.local") });
loadEnv({ path: resolve(process.cwd(), ".env") });

const REQUIRED = ["SEED_ADMIN_NAME", "SEED_ADMIN_EMAIL", "SEED_ADMIN_PASSWORD"] as const;

function main(): void {
  const missing = REQUIRED.filter((k) => !process.env[k]?.trim());
  if (missing.length > 0) {
    console.error(
      `[seed-admin] Missing required environment variables:\n${missing.map((m) => `  • ${m}`).join("\n")}`
    );
    process.exit(1);
  }

  void run();
}

async function run(): Promise<void> {
  const name = process.env.SEED_ADMIN_NAME!.trim();
  const email = process.env.SEED_ADMIN_EMAIL!.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD!;

  if (password.length < 8) {
    console.error("[seed-admin] SEED_ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  try {
    await connectDB();

    const exists = await AdminUser.findOne({ email });
    if (exists) {
      console.log(`[seed-admin] Admin with email "${email}" already exists. Skipping.`);
      process.exit(0);
    }

    const passwordHash = await hashPassword(password);

    await AdminUser.create({
      name,
      email,
      passwordHash,
      role: "superAdmin",
      status: "active",
    });

    console.log(`[seed-admin] Created super-admin for "${email}". (Password not logged.)`);
    process.exit(0);
  } catch (err) {
    console.error("[seed-admin] Failed:", err);
    process.exit(1);
  }
}

main();
