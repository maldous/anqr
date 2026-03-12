import { decompressFrames, parseGIF } from 'gifuct-js';
import type { DecodedGif, GifPatchFrame } from './gif-codec.types';
import { log } from './gif-codec._internal';

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
