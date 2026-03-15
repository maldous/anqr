import { convolve } from './convolve';

export function blur(imageData: ImageData, radius: number = 1): ImageData {
  const size = 2 * radius + 1;
  const kernel = new Array(size).fill(null).map(() => new Array(size).fill(1));
  return convolve(imageData, kernel);
}
