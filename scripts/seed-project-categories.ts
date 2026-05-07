/**
 * Seeds default project categories.
 *
 * Safe to rerun: existing slugs are skipped.
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { connectDB } from "../src/lib/db";
import { ProjectCategory } from "../src/models/ProjectCategory";
import { generateSlug } from "../src/lib/slug";

loadEnv({ path: resolve(process.cwd(), ".env.local") });
loadEnv({ path: resolve(process.cwd(), ".env") });

const CATEGORIES = [
  { name: "Healthcare", group: "engineering" },
  { name: "Pharmaceuticals", group: "engineering" },
  { name: "Power Plants", group: "engineering" },
  { name: "FMCG", group: "engineering" },
  { name: "Oil Refinery", group: "engineering" },
  { name: "Automotive", group: "engineering" },
  { name: "Dairy", group: "engineering" },
  { name: "Operation and Maintenance", group: "engineering" },
  { name: "Agriculture", group: "agriculture" },
  { name: "Industrial Automation", group: "industrialAutomation" },
  { name: "Commercial", group: "engineering" },
  { name: "Energy", group: "engineering" },
  { name: "Infrastructure", group: "engineering" },
] as const;

async function run(): Promise<void> {
  await connectDB();
  let created = 0;
  let skipped = 0;

  for (let i = 0; i < CATEGORIES.length; i++) {
    const item = CATEGORIES[i];
    const slug = generateSlug(item.name);
    const exists = await ProjectCategory.exists({ slug });
    if (exists) {
      skipped++;
      continue;
    }

    await ProjectCategory.create({
      name: item.name,
      slug,
      projectGroup: item.group,
      status: "active",
      order: i,
      seo: { schemaType: "CollectionPage" },
    });
    created++;
  }

  console.log(
    `[seed-project-categories] Done. Created: ${created}, skipped: ${skipped}.`
  );
}

run().catch((err) => {
  console.error("[seed-project-categories] Failed:", err);
  process.exit(1);
});

