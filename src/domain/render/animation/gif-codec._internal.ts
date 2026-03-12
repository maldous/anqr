import * as gifencNs from 'gifenc';
import { createLogger } from '../../../infra/logging/logger';

export const log = createLogger('ANIMATION');

export interface GifEncoderLike {
  writeFrame: (
    index: Uint8Array,
    width: number,
    height: number,
    options: Record<string, unknown>
  ) => void;
  finish: () => void;
  bytesView: () => Uint8Array;
  bytes: () => Uint8Array;
}

export type GifEncoderFactory = () => GifEncoderLike;

export type QuantizeFn = (data: Uint8ClampedArray, colors: number) => number[][];

export type ApplyPaletteFn = (data: Uint8ClampedArray, palette: number[][]) => Uint8Array;

export function resolveGifEnc() {
  const ns = gifencNs as {
    GIFEncoder?: GifEncoderFactory;
    quantize?: QuantizeFn;
    applyPalette?: ApplyPaletteFn;
    default?: {
      GIFEncoder?: GifEncoderFactory;
      quantize?: QuantizeFn;
      applyPalette?: ApplyPaletteFn;
    };
  };
  return {
    GIFEncoder: ns.GIFEncoder ?? ns.default?.GIFEncoder,
    quantize: ns.quantize ?? ns.default?.quantize,
    applyPalette: ns.applyPalette ?? ns.default?.applyPalette,
  };
}

export const GIFENC = resolveGifEnc();

