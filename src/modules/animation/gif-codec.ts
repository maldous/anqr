import * as gifencNs from 'gifenc';
import { decompressFrames, parseGIF } from 'gifuct-js';
import { createLogger } from '../../lib/logger';

const log = createLogger('ANIMATION');

export interface GifPatchFrame {
  dims: { left: number; top: number; width: number; height: number };
  patch: Uint8Array;
  disposalType: number;
  delay: number; // milliseconds (gifuct-js converts centiseconds internally)
}

export interface DecodedGif {
  width: number;
  height: number;
  frames: GifPatchFrame[];
}

interface GifEncoderLike {
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

type GifEncoderFactory = () => GifEncoderLike;
type QuantizeFn = (data: Uint8ClampedArray, colors: number) => number[][];
type ApplyPaletteFn = (data: Uint8ClampedArray, palette: number[][]) => Uint8Array;

function resolveGifEnc() {
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

const GIFENC = resolveGifEnc();

export function isGifEncodingAvailable(): boolean {
  return Boolean(GIFENC.GIFEncoder && GIFENC.quantize && GIFENC.applyPalette);
}

export function createGifEncoder(): GifEncoderLike {
  if (!GIFENC.GIFEncoder) {
    throw new Error('GIF encoder is unavailable in this runtime');
  }
  return GIFENC.GIFEncoder();
}

export function quantizeGifPalette(data: Uint8ClampedArray, colors: number): number[][] {
  if (!GIFENC.quantize) {
    throw new Error('GIF encoder is unavailable in this runtime');
  }
  return GIFENC.quantize(data, colors);
}

export function indexGifPixels(data: Uint8ClampedArray, palette: number[][]): Uint8Array {
  if (!GIFENC.applyPalette) {
    throw new Error('GIF encoder is unavailable in this runtime');
  }
  return GIFENC.applyPalette(data, palette);
}

export function decodeGif(arrayBuffer: ArrayBuffer): DecodedGif {
  const parsed = parseGIF(arrayBuffer);
  const frames = decompressFrames(parsed, true) as unknown as GifPatchFrame[];
  const { width, height } = parsed.lsd;

  const uniqueDelays = [...new Set(frames.map((f) => f.delay))].sort((a, b) => a - b);
  const uniqueDisposals = [...new Set(frames.map((f) => f.disposalType))].sort((a, b) => a - b);
  const totalDurationMs = frames.reduce((sum, f) => sum + f.delay, 0);

  log.debug('decodeGif: decoded', {
    width,
    height,
    frameCount: frames.length,
    firstDelays: frames.slice(0, 5).map((f) => f.delay),
    uniqueDelays,
    uniqueDisposals,
    totalDurationMs,
    bytesIn: arrayBuffer.byteLength,
  });

  return { width, height, frames };
}

export function isGifSignature(buffer: ArrayBuffer): boolean {
  const view = new DataView(buffer);
  if (view.byteLength < 6) return false;
  return (
    view.getUint8(0) === 0x47 && view.getUint8(1) === 0x49 && view.getUint8(2) === 0x46 // GIF
  );
}
