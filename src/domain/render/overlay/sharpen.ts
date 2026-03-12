import { convolve } from './convolve';

export function sharpen(imageData: ImageData, amount: number = 1): ImageData {
  const kernel = [
    [0, -amount, 0],
    [-amount, 1 + 4 * amount, -amount],
    [0, -amount, 0],
  ];
  return convolve(imageData, kernel, 1);
}
