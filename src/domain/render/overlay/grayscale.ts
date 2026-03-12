import { rgbToGray } from '../color/color';

export function grayscale(imageData: ImageData): ImageData {
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(rgbToGray(data[i], data[i + 1], data[i + 2]));
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }

  return imageData;
}
