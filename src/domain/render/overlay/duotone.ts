import { rgbToGray } from '../color/color';
import type { RGB } from './overlay-color-types';

export function duotone(imageData: ImageData, lightColor: RGB, darkColor: RGB): ImageData {
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = rgbToGray(data[i], data[i + 1], data[i + 2]) / 255;
    data[i] = Math.round(darkColor.r * (1 - gray) + lightColor.r * gray);
    data[i + 1] = Math.round(darkColor.g * (1 - gray) + lightColor.g * gray);
    data[i + 2] = Math.round(darkColor.b * (1 - gray) + lightColor.b * gray);
  }

  return imageData;
}
