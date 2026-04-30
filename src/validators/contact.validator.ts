import { z } from "zod";

export const contactValidator = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name is too long.")
    .trim(),
  email: z
    .string()
    .email("Please enter a valid email address.")
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .max(20, "Phone number is too long.")
    .optional()
    .or(z.literal("")),
  subject: z
    .string()
    .min(3, "Subject must be at least 3 characters.")
    .max(200, "Subject is too long.")
    .trim(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters.")
    .max(5000, "Message is too long.")
    .trim(),
});

export type ContactInput = z.infer<typeof contactValidator>;
