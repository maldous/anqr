import { convolveServer } from "./convolve-server.ts";

export function blurServer(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number,
): Uint8ClampedArray {
  if (radius <= 0) return data;
  const size = 2 * Math.min(radius, 10) + 1; // Cap radius at 10 for performance
  const kernel = Array.from({ length: size }, () => Array.from({ length: size }, () => 1));
  return convolveServer(data, width, height, kernel);
}
