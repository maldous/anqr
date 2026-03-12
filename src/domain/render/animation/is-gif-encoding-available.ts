import { GIFENC } from './gif-codec._internal';

export function isGifEncodingAvailable(): boolean {
  return Boolean(GIFENC.GIFEncoder && GIFENC.quantize && GIFENC.applyPalette);
}
