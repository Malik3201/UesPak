import { z } from "zod";

/**
 * Public contact-form submission shape. Used both by the public POST
 * `/api/contact` and by the admin enquiries list/detail views.
 *
 * Optional fields use `.or(z.literal(""))` so empty strings coming from
 * the form don't fail validation; the API normalizes empty strings to
 * `undefined` before persisting.
 */
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
    .max(30, "Phone number is too long.")
    .optional()
    .or(z.literal("")),
  company: z
    .string()
    .max(160, "Company name is too long.")
    .optional()
    .or(z.literal("")),
  subject: z
    .string()
    .min(3, "Subject must be at least 3 characters.")
    .max(200, "Subject is too long.")
    .trim(),
  serviceInterest: z
    .string()
    .max(160, "Service of interest is too long.")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters.")
    .max(5000, "Message is too long.")
    .trim(),
  consent: z.boolean().optional(),
  // Honeypot field — must be empty. Spam bots tend to fill every input.
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactValidator>;

/** Admin enquiry status update payload. */
export const enquiryStatusUpdateSchema = z.object({
  status: z.enum(["new", "read", "replied", "archived"]),
});

export type EnquiryStatusUpdateInput = z.infer<typeof enquiryStatusUpdateSchema>;
