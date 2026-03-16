/**
 * Validate and normalize a color string.
 * Returns the color if valid, otherwise returns the fallback.
 * This prevents issues where invalid color strings (empty, malformed) cause
 * canvas fillStyle to default to black.
 */
export function validateColor(color: unknown, fallback: string): string {
  if (typeof color !== "string" || !color) {
    return fallback;
  }
  // Must be at least '#000' (4 chars) or 'rgb(' format
  const trimmed = color.trim();
  if (trimmed.length < 4) {
    return fallback;
  }
  // Check for valid hex color (#RGB, #RRGGBB, #RRGGBBAA)
  if (trimmed.startsWith("#")) {
    const hex = trimmed.slice(1);
    if (!/^[0-9a-fA-F]{3,8}$/.test(hex)) {
      return fallback;
    }
    return trimmed;
  }
  // Check for rgb/rgba format
  if (trimmed.startsWith("rgb")) {
    return trimmed;
  }
  // Check for hsl/hsla format
  if (trimmed.startsWith("hsl")) {
    return trimmed;
  }
  // Check for named colors (basic validation - just ensure it's alphanumeric)
  if (/^[a-zA-Z]+$/.test(trimmed)) {
    return trimmed;
  }
  return fallback;
}
