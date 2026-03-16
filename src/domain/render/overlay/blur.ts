import { convolve } from './convolve';

export function blur(imageData: ImageData, radius: number = 1): ImageData {
  const size = 2 * radius + 1;
  const kernel = Array.from({ length: size }, () => Array.from({ length: size }, () => 1));
  return convolve(imageData, kernel);
}
