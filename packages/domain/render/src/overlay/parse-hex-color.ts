/**
 * Parse hex color to RGB
 */
export function parseHexColor(hex: string | undefined): { r: number; g: number; b: number } | null {
  if (!hex) return null;
  const match = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (match) {
    return {
      r: Number.parseInt(match[1], 16),
      g: Number.parseInt(match[2], 16),
      b: Number.parseInt(match[3], 16),
    };
  }
  return null;
}
