/**
 * Seeds draft Agriculture service records (no images, no publishing).
 *
 * Safe to run multiple times: skips existing slugs.
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { connectDB } from "../src/lib/db";
import { Service } from "../src/models/Service";
import { generateSlug } from "../src/lib/slug";

loadEnv({ path: resolve(process.cwd(), ".env.local") });
loadEnv({ path: resolve(process.cwd(), ".env") });

const ITEMS = [
  "Agricultural Training",
  "Regenerative Farming",
  "Organic Crop Production",
  "Edible Food Forest",
  "Syntropic Farming",
  "Permaculture Designing",
  "Rainwater Harvesting",
  "Livestock",
  "Agricultural Engineering",
  "Home Gardening",
  "Landscaping",
] as const;

async function run(): Promise<void> {
  await connectDB();

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < ITEMS.length; i++) {
    const title = ITEMS[i];
    const slug = generateSlug(title);
    const exists = await Service.exists({ slug });
    if (exists) {
      skipped++;
      continue;
    }

    await Service.create({
      title,
      slug,
      serviceGroup: "agriculture",
      status: "draft",
      excerpt: `Draft: ${title}. Add details, media, and SEO before publishing.`,
      order: i,
      isFeatured: false,
      gallery: [],
      bulletPoints: [],
      faqs: [],
      cta: { isActive: false },
      seo: { schemaType: "Service" },
    });

    created++;
  }

  console.log(
    `[seed-agriculture-services] Done. Created: ${created}, skipped (already existed): ${skipped}.`
  );
}

run().catch((err) => {
  console.error("[seed-agriculture-services] Failed:", err);
  process.exit(1);
});

