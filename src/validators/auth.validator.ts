import { z } from "zod";

export const loginValidator = z.object({
  email: z
    .string()
    .email("Please enter a valid email address.")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password is too long."),
});

export type LoginInput = z.infer<typeof loginValidator>;
