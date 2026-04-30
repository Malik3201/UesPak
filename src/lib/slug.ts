import slugifyLib from "slugify";

/**
 * Generate a URL-safe slug from a string.
 */
export function generateSlug(text: string): string {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    trim: true,
  });
}
