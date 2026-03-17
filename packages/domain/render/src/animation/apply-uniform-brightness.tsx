import { clampToByte } from "./clamp-to-byte";

export function applyUniformBrightness(data: Uint8ClampedArray, factor: number): void {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clampToByte(data[i] * factor);
    data[i + 1] = clampToByte(data[i + 1] * factor);
    data[i + 2] = clampToByte(data[i + 2] * factor);
  }
}
