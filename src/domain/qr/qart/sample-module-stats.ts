import { rgbToLumaLinear } from "../../render/color/color";
import { computeSobelContribution } from "./compute-sobel-contribution";

export function sampleModuleStats(
  imageData: ImageData,
  samplePoints: Array<{ dx: number; dy: number }>,
  supersampleLevel: number,
  row: number,
  col: number,
  scaleX: number,
  scaleY: number,
  maxX: number,
  maxY: number,
): { avgGray: number; contrast: number; edgeMagnitude: number } {
  let totalGray = 0;
  let minGray = 255;
  let maxGray = 0;
  let sobelX = 0;
  let sobelY = 0;

  for (const { dx, dy } of samplePoints) {
    const imgX = Math.max(0, Math.min(maxX, Math.floor((col + dx) * scaleX)));
    const imgY = Math.max(0, Math.min(maxY, Math.floor((row + dy) * scaleY)));
    const idx = (imgY * imageData.width + imgX) * 4;

    const rawGray =
      rgbToLumaLinear(imageData.data[idx], imageData.data[idx + 1], imageData.data[idx + 2]) * 255;
    const gray = Number.isFinite(rawGray) ? rawGray : 255;
    totalGray += gray;
    minGray = Math.min(minGray, gray);
    maxGray = Math.max(maxGray, gray);

    if (supersampleLevel >= 2) {
      const sobel = computeSobelContribution(imageData, imgX, imgY, maxX, maxY);
      sobelX += sobel.sobelX;
      sobelY += sobel.sobelY;
    }
  }

  return {
    avgGray: totalGray / samplePoints.length,
    contrast: maxGray - minGray,
    edgeMagnitude: Math.min(255, Math.hypot(sobelX, sobelY)),
  };
}
