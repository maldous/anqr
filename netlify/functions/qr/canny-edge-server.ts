import { sobelEdgeServer } from "./sobel-edge-server";

export function cannyEdgeServer(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  lowThreshold: number = 50,
  highThreshold: number = 150,
): Uint8ClampedArray {
  // First apply Sobel
  const sobelResult = sobelEdgeServer(data, width, height);
  const result = new Uint8ClampedArray(sobelResult);

  // Apply hysteresis thresholding
  for (let i = 0; i < result.length; i += 4) {
    const magnitude = result[i];
    const value = magnitude > highThreshold ? 255 : magnitude > lowThreshold ? 128 : 0;
    result[i] = value;
    result[i + 1] = value;
    result[i + 2] = value;
  }

  return result;
}
