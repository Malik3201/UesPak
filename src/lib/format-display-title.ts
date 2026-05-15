/** Normalize ALL-CAPS CMS titles for consistent professional display. */
export function formatDisplayTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return "";

  const letters = trimmed.replace(/[^a-zA-Z]/g, "");
  const upperCount = letters.match(/[A-Z]/g)?.length ?? 0;
  const isMostlyUpper =
    letters.length > 2 && upperCount / letters.length > 0.85;

  if (!isMostlyUpper) return trimmed;

  return trimmed
    .split(/\s+/)
    .map((word) => {
      if (!word) return word;
      if (word.length <= 4 && word === word.toUpperCase()) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}
