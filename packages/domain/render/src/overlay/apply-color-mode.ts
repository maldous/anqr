import { rgbToGray } from "../color/color";
import type { ColorMode } from "./overlay-filters.types";

// ============================================
// COLOR MODE
// ============================================

export function applyColorMode(imageData: ImageData, mode: ColorMode): ImageData {
  if (mode === "color") return imageData;

  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(rgbToGray(data[i], data[i + 1], data[i + 2]));

    if (mode === "bw") {
      const value = gray > 128 ? 255 : 0;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
    } else {
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
  }

  return imageData;
}
