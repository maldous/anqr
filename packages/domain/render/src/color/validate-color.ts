/**
 * Validate and normalize a color string.
 * Returns the color if valid, otherwise returns the fallback.
 */
export function validateColor(color: unknown, fallback: string): string {
  if (typeof color !== "string" || !color) {
    return fallback;
  }

  const trimmed = color.trim();
  if (trimmed.length < 4) {
    return fallback;
  }

  if (trimmed.startsWith("#")) {
    const hex = trimmed.slice(1);
    if (!/^[0-9a-fA-F]{3,8}$/.test(hex)) {
      return fallback;
    }
    return trimmed;
  }

  if (trimmed.startsWith("rgb")) {
    return trimmed;
  }

  if (trimmed.startsWith("hsl")) {
    return trimmed;
  }

  if (/^[a-zA-Z]+$/.test(trimmed)) {
    return trimmed;
  }

  return fallback;
}
