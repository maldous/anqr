import { type LuminanceSource, RGBALuminanceSource } from './luminance';

export function createLuminanceSource(imageData: ImageData): LuminanceSource {
  const { data, width, height } = imageData;
  const luminances = new Uint8ClampedArray(width * height);

  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    const a = data[idx + 3] / 255;

    if (a <= 0) {
      luminances[i] = 255;
    } else if (a >= 1) {
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      luminances[i] = Math.round((r + 2 * g + b) / 4);
    } else {
      const inv = 1 - a;
      const r = data[idx] * a + 255 * inv;
      const g = data[idx + 1] * a + 255 * inv;
      const b = data[idx + 2] * a + 255 * inv;
      luminances[i] = Math.round((r + 2 * g + b) / 4);
    }
  }

  return new RGBALuminanceSource(luminances, width, height);
}
