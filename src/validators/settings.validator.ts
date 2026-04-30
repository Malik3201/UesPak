import { z } from "zod";

export const siteSettingsValidator = z.object({
  siteName: z.string().max(100).optional(),
  tagline: z.string().max(200).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().max(500).optional(),
  linkedIn: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
  facebook: z.string().url().optional().or(z.literal("")),
  instagram: z.string().url().optional().or(z.literal("")),
  googleAnalyticsId: z.string().max(50).optional(),
  maintenanceMode: z.boolean().default(false),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsValidator>;
