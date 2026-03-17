import type { VectorFinderStyle } from "@/modules/exporter/types";

export function generateStyledCenterShapeSvg(
  x: number,
  y: number,
  size: number,
  moduleSize: number,
  style: VectorFinderStyle,
  fillColor: string,
): string {
  if (style === "circle") {
    return `<circle cx="${x + size / 2}" cy="${y + size / 2}" r="${size / 2}" fill="${fillColor}"/>`;
  }

  if (style === "rounded") {
    const radius = moduleSize * 0.2;
    return `<path d="M${x + radius},${y}h${size - 2 * radius}a${radius},${radius} 0 0 1 ${radius},${radius}v${size - 2 * radius}a${radius},${radius} 0 0 1 ${-radius},${radius}h${-(size - 2 * radius)}a${radius},${radius} 0 0 1 ${-radius},${-radius}v${-(size - 2 * radius)}a${radius},${radius} 0 0 1 ${radius},${-radius}Z" fill="${fillColor}"/>`;
  }

  return `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${fillColor}"/>`;
}
