import { rgbToGray } from "../color/color";

// ============================================
// DATA EXTRACTION
// ============================================

export function getBrightnessMap(imageData: ImageData): Float32Array {
  const data = imageData.data;
  const map = new Float32Array(data.length / 4);

  for (let i = 0; i < data.length; i += 4) {
    map[i / 4] = rgbToGray(data[i], data[i + 1], data[i + 2]) / 255;
  }

  return map;
}
