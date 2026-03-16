import { grayAt } from "./decoder-color-utils";

export function analyzeColors(
  imageData: ImageData,
  location: {
    topLeftCorner: { x: number; y: number };
    bottomRightCorner: { x: number; y: number };
  },
): { foreground: string; background: string; contrastRatio: number } {
  const { data, width } = imageData;
  const minX = Math.max(0, Math.floor(location.topLeftCorner.x));
  const maxX = Math.min(imageData.width - 1, Math.ceil(location.bottomRightCorner.x));
  const minY = Math.max(0, Math.floor(location.topLeftCorner.y));
  const maxY = Math.min(imageData.height - 1, Math.ceil(location.bottomRightCorner.y));

  const darkPixels: number[] = [];
  const lightPixels: number[] = [];

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const idx = (y * width + x) * 4;
      const gray = grayAt(data, idx);
      if (gray < 128) {
        darkPixels.push(gray);
      } else {
        lightPixels.push(gray);
      }
    }
  }

  const avgDark =
    darkPixels.length > 0
      ? Math.round(darkPixels.reduce((a, b) => a + b, 0) / darkPixels.length)
      : 0;
  const avgLight =
    lightPixels.length > 0
      ? Math.round(lightPixels.reduce((a, b) => a + b, 0) / lightPixels.length)
      : 255;

  const l1 = avgLight / 255 + 0.05;
  const l2 = avgDark / 255 + 0.05;
  const contrastRatio = Math.round((Math.max(l1, l2) / Math.min(l1, l2)) * 100) / 100;

  return {
    foreground: `#${avgDark.toString(16).padStart(2, "0").repeat(3)}`,
    background: `#${avgLight.toString(16).padStart(2, "0").repeat(3)}`,
    contrastRatio,
  };
}
