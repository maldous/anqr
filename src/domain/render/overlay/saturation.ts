import { rgbToGray } from '../color/color';

export function saturation(imageData: ImageData, amount: number): ImageData {
  const data = imageData.data;
  const factor = amount / 100;

  for (let i = 0; i < data.length; i += 4) {
    const gray = rgbToGray(data[i], data[i + 1], data[i + 2]);
    data[i] = Math.max(0, Math.min(255, Math.round(gray + factor * (data[i] - gray))));
    data[i + 1] = Math.max(0, Math.min(255, Math.round(gray + factor * (data[i + 1] - gray))));
    data[i + 2] = Math.max(0, Math.min(255, Math.round(gray + factor * (data[i + 2] - gray))));
  }

  return imageData;
}
