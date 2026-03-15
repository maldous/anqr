import type { DominantColor } from './analyzer-content.types';

/**
 * Extract dominant colors from image data
 */
export function extractDominantColors(
  imageData: ImageData,
  maxColors: number = 5
): DominantColor[] {
  const data = imageData.data;
  const colorMap = new Map<string, number>();

  // Sample pixels (every 4th pixel for performance)
  for (let i = 0; i < data.length; i += 16) {
    const r = Math.round(data[i] / 32) * 32;
    const g = Math.round(data[i + 1] / 32) * 32;
    const b = Math.round(data[i + 2] / 32) * 32;
    const key = `${r},${g},${b}`;
    colorMap.set(key, (colorMap.get(key) ?? 0) + 1);
  }

  const totalPixels = data.length / 16;
  const sorted = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxColors);

  return sorted.map(([key, count]) => {
    const [r, g, b] = key.split(',').map(Number);
    return {
      color: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
      percentage: Math.round((count / totalPixels) * 100),
      rgb: { r, g, b },
    };
  });
}
