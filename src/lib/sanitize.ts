import sanitize from "sanitize-html";

const DEFAULT_OPTIONS: sanitize.IOptions = {
  allowedTags: [
    "b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li",
    "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "code",
    "span", "div", "img",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height"],
    "*": ["class"],
  },
  allowedSchemes: ["http", "https", "mailto"],
};

/**
 * Sanitize HTML to prevent XSS attacks.
 * Uses a safe whitelist of allowed tags and attributes.
 */
export function sanitizeHtml(dirty: string, options?: sanitize.IOptions): string {
  return sanitize(dirty, options ?? DEFAULT_OPTIONS);
}

/**
 * Strip ALL HTML tags and return plain text.
 */
export function stripHtml(dirty: string): string {
  return sanitize(dirty, { allowedTags: [], allowedAttributes: {} });
}
