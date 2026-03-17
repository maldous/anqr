import { rgbToLumaSrgb } from "./rgb-to-luma-srgb";

export function luma01(r: number, g: number, b: number): number {
  return rgbToLumaSrgb(r, g, b);
}
