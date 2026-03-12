/**
 * Lighten a color by a factor (0-1)
 */
export function lightenColor(color: string, factor: number): string {
  const hex = color.replace('#', '');
  const r = Math.round(
    Number.parseInt(hex.substring(0, 2), 16) +
      (255 - Number.parseInt(hex.substring(0, 2), 16)) * factor
  );
  const g = Math.round(
    Number.parseInt(hex.substring(2, 4), 16) +
      (255 - Number.parseInt(hex.substring(2, 4), 16)) * factor
  );
  const b = Math.round(
    Number.parseInt(hex.substring(4, 6), 16) +
      (255 - Number.parseInt(hex.substring(4, 6), 16)) * factor
  );
  return `rgb(${r},${g},${b})`;
}
