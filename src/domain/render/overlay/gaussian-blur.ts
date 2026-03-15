import { convolve } from './convolve';

export function gaussianBlur(imageData: ImageData, radius: number = 1): ImageData {
  // Simple 3x3 Gaussian
  const kernel = [
    [1, 2, 1],
    [2, 4, 2],
    [1, 2, 1],
  ];
  let result = imageData;
  for (let i = 0; i < radius; i++) {
    result = convolve(result, kernel);
  }
  return result;
}
