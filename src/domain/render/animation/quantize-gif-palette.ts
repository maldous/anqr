import { GIFENC } from './gif-codec._internal';

export function quantizeGifPalette(data: Uint8ClampedArray, colors: number): number[][] {
  if (!GIFENC.quantize) {
    throw new Error('GIF encoder is unavailable in this runtime');
  }
  return GIFENC.quantize(data, colors);
}
