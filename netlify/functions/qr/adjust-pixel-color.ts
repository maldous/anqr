import { applyHueSaturationToPixel } from "./apply-hue-saturation-to-pixel";

export function adjustPixelColor(
  r: number,
  g: number,
  b: number,
  invert: boolean,
  brightness: number,
  contrastFactor: number,
  gamma: number,
  saturation: number,
  hue: number,
): [number, number, number] {
  if (invert) {
    r = 1 - r;
    g = 1 - g;
    b = 1 - b;
  }
  r += brightness;
  g += brightness;
  b += brightness;
  r = (r - 0.5) * contrastFactor + 0.5;
  g = (g - 0.5) * contrastFactor + 0.5;
  b = (b - 0.5) * contrastFactor + 0.5;
  if (gamma !== 1) {
    r = Math.max(0, r) ** (1 / gamma);
    g = Math.max(0, g) ** (1 / gamma);
    b = Math.max(0, b) ** (1 / gamma);
  }
  if (saturation !== 0 || hue !== 0) {
    [r, g, b] = applyHueSaturationToPixel(r, g, b, saturation, hue);
  }
  return [r, g, b];
}
