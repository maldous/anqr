import { sobelEdge } from './sobel-edge';
import { copyImageData } from './copy-image-data';

export function cannyEdge(
  imageData: ImageData,
  lowThreshold: number = 50,
  highThreshold: number = 150
): ImageData {
  // Simplified Canny: just use Sobel + threshold
  const sobelResult = sobelEdge(copyImageData(imageData));
  const data = sobelResult.data;

  for (let i = 0; i < data.length; i += 4) {
    const magnitude = data[i];
    const value = magnitude > highThreshold ? 255 : magnitude > lowThreshold ? 128 : 0;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }

  imageData.data.set(data);
  return imageData;
}
