import { GIFENC } from "./gifenc";

export function indexGifPixels(data: Uint8ClampedArray, palette: number[][]): Uint8Array {
  if (!GIFENC.applyPalette) {
    throw new Error("GIF encoder is unavailable in this runtime");
  }
  return GIFENC.applyPalette(data, palette);
}
