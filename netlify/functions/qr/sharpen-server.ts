import { convolveServer } from "./convolve-server.ts";

export function sharpenServer(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  amount: number,
): Uint8ClampedArray {
  if (amount <= 0) return data;
  const strength = amount / 100; // Normalize 0-100 to 0-1
  const kernel = [
    [0, -strength, 0],
    [-strength, 1 + 4 * strength, -strength],
    [0, -strength, 0],
  ];
  return convolveServer(data, width, height, kernel, 1);
}
