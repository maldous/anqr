/**
 * Darken a color by a factor (0-1)
 */
export function darkenColor(color: string, factor: number): string {
  const hex = color.replace("#", "");
  const r = Math.round(Number.parseInt(hex.substring(0, 2), 16) * (1 - factor));
  const g = Math.round(Number.parseInt(hex.substring(2, 4), 16) * (1 - factor));
  const b = Math.round(Number.parseInt(hex.substring(4, 6), 16) * (1 - factor));
  return `rgb(${r},${g},${b})`;
}
