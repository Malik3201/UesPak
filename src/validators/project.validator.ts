import { z } from "zod";

const statusEnum = z.enum(["draft", "published", "archived"]);

export const projectValidator = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters.")
    .max(200, "Title is too long.")
    .trim(),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only.")
    .trim(),
  excerpt: z.string().max(500).optional(),
  body: z.string().optional(),
  client: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  completionYear: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 5)
    .optional(),
  category: z.string().optional(), // MongoDB ObjectId string
  status: statusEnum.default("draft"),
  featured: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
});

export type ProjectInput = z.infer<typeof projectValidator>;
