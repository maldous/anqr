import { GIFENC } from './gifenc';

export function isGifEncodingAvailable(): boolean {
  return Boolean(GIFENC.GIFEncoder && GIFENC.quantize && GIFENC.applyPalette);
}
