import { rgbToGray } from "../color/color";
import { fitOverlayImage } from "./fit-overlay-image";

// ============================================
// OVERLAY DATA EXTRACTION
// ============================================

export function extractOverlayBrightnessData(
  canvas: HTMLCanvasElement,
  targetSize: number,
): Float32Array {
  // Resize to target size for module-level data
  const resized = fitOverlayImage(canvas, targetSize, targetSize, "cover");
  const ctx = resized.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D context");

  const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
  const data = imageData.data;
  const brightness = new Float32Array(targetSize * targetSize);

  for (let i = 0; i < data.length; i += 4) {
    // Convert to grayscale brightness (0-1)
    brightness[i / 4] = rgbToGray(data[i], data[i + 1], data[i + 2]) / 255;
  }

  return brightness;
}
