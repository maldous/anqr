import { rgbToGrayServer } from "./rgb-to-gray-server.ts";

export function thresholdServer(data: Uint8ClampedArray, level: number): Uint8ClampedArray {
  const result = new Uint8ClampedArray(data);

  for (let i = 0; i < result.length; i += 4) {
    const gray = rgbToGrayServer(result[i], result[i + 1], result[i + 2]);
    const value = gray > level ? 255 : 0;
    result[i] = value;
    result[i + 1] = value;
    result[i + 2] = value;
  }

  return result;
}
