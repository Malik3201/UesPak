import { z } from "zod";

export const mediaUploadValidator = z.object({
  altText: z.string().max(200).optional(),
  caption: z.string().max(500).optional(),
  folder: z
    .string()
    .min(1, "Folder is required.")
    .regex(/^[a-z0-9/_-]+$/, "Folder must be a valid path."),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export type MediaUploadInput = z.infer<typeof mediaUploadValidator>;
