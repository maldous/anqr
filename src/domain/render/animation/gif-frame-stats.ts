import type { GifPatchFrame } from './gif-codec.types';

export function getGifFrameStats(frames: GifPatchFrame[]): {
  uniqueDelays: number[];
  uniqueDisposals: number[];
  totalDurationMs: number;
} {
  const uniqueDelays = [...new Set(frames.map((f) => f.delay))].sort((a, b) => a - b);
  const uniqueDisposals = [...new Set(frames.map((f) => f.disposalType))].sort((a, b) => a - b);
  const totalDurationMs = frames.reduce((sum, f) => sum + f.delay, 0);
  return { uniqueDelays, uniqueDisposals, totalDurationMs };
}
