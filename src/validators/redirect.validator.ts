import { z } from "zod";

const statusCodeSchema = z.union([
  z.literal(301),
  z.literal(302),
  z.literal(307),
  z.literal(308),
]);

const fromPathSchema = z
  .string()
  .trim()
  .min(1, "From path is required.")
  .max(500)
  .refine((p) => p.startsWith("/"), "From path must start with /.")
  .refine((p) => !/^https?:\/\//i.test(p), "From path must not include a domain.")
  .transform((p) => {
    if (p.length > 1 && p.endsWith("/")) return p.replace(/\/+$/, "") || "/";
    return p;
  });

const toPathSchema = z
  .string()
  .trim()
  .min(1, "To path is required.")
  .max(2000)
  .refine(
    (p) => p.startsWith("/") || /^https?:\/\//i.test(p),
    "To path must be an internal path (/) or http(s) URL."
  );

export const redirectCreateSchema = z
  .object({
    fromPath: fromPathSchema,
    toPath: toPathSchema,
    statusCode: statusCodeSchema.default(301),
    isActive: z.boolean().default(true),
    notes: z
      .string()
      .trim()
      .max(2000)
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
  })
  .refine((data) => data.fromPath !== data.toPath, {
    message: "From path and to path cannot be the same.",
    path: ["toPath"],
  });

export const redirectUpdateSchema = z
  .object({
    fromPath: fromPathSchema.optional(),
    toPath: toPathSchema.optional(),
    statusCode: statusCodeSchema.optional(),
    isActive: z.boolean().optional(),
    notes: z
      .string()
      .trim()
      .max(2000)
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
  })
  .refine(
    (data) => {
      if (data.fromPath && data.toPath) return data.fromPath !== data.toPath;
      return true;
    },
    { message: "From path and to path cannot be the same.", path: ["toPath"] }
  );

export type RedirectCreateInput = z.infer<typeof redirectCreateSchema>;
export type RedirectUpdateInput = z.infer<typeof redirectUpdateSchema>;
