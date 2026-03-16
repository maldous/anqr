import { hue2rgbServer } from "./hue2rgb-server";

export function applyHueSaturationToPixel(
  r: number,
  g: number,
  b: number,
  saturation: number,
  hue: number,
): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  h += hue / (2 * Math.PI);
  if (h > 1) h -= 1;
  if (h < 0) h += 1;
  s = Math.max(0, Math.min(1, s * (1 + saturation)));

  if (s === 0) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue2rgbServer(p, q, h + 1 / 3), hue2rgbServer(p, q, h), hue2rgbServer(p, q, h - 1 / 3)];
}
