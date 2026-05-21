import { z } from "zod";

const roleSchema = z.enum(["superAdmin", "admin", "editor", "viewer"]);
const statusSchema = z.enum(["active", "inactive", "suspended"]);

export const adminUserCreateSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required.").max(120),
    email: z.string().trim().email("Valid email is required.").max(200),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8).optional(),
    role: roleSchema.default("editor"),
    status: statusSchema.default("active"),
  })
  .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const adminUserUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    email: z.string().trim().email().max(200).optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .optional()
      .or(z.literal("")),
    confirmPassword: z.string().optional(),
    role: roleSchema.optional(),
    status: statusSchema.optional(),
  })
  .refine(
    (data) => {
      if (!data.password) return true;
      if (!data.confirmPassword) return data.password.length >= 8;
      return data.password === data.confirmPassword;
    },
    { message: "Passwords do not match.", path: ["confirmPassword"] }
  );

export type AdminUserCreateInput = z.infer<typeof adminUserCreateSchema>;
export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>;
