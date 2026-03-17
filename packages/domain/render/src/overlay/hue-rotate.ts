import { hslToRgb, rgbToHsl } from "../color/color";

export function hueRotate(imageData: ImageData, degrees: number): ImageData {
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const hsl = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    hsl.h = (hsl.h + degrees) % 360;
    if (hsl.h < 0) hsl.h += 360;
    const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    data[i] = rgb.r;
    data[i + 1] = rgb.g;
    data[i + 2] = rgb.b;
  }

  return imageData;
}
