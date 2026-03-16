import { fillModuleBlock } from "./fill-module-block";

export function renderMatrixToImageData(
  matrix: boolean[][],
  moduleCount: number,
  scale: number,
  quietZone: number,
  invert: boolean,
): ImageData {
  const size = (moduleCount + quietZone * 2) * scale;
  const data = new Uint8ClampedArray(size * size * 4);

  const bgColor = invert ? 0 : 255;
  const fgColor = invert ? 255 : 0;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = bgColor;
    data[i + 1] = bgColor;
    data[i + 2] = bgColor;
    data[i + 3] = 255;
  }

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const isDark = matrix[row]?.[col] ?? false;
      if (isDark) {
        const startX = (col + quietZone) * scale;
        const startY = (row + quietZone) * scale;
        fillModuleBlock(data, size, startX, startY, scale, fgColor);
      }
    }
  }

  return new ImageData(data, size, size);
}
