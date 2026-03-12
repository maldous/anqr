import { convolve } from './convolve';

export function emboss(imageData: ImageData): ImageData {
  const kernel = [
    [-2, -1, 0],
    [-1, 1, 1],
    [0, 1, 2],
  ];
  return convolve(imageData, kernel, 1);
}
