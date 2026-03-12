import type { AnimationFrame } from '../../../modules/animation/types';

interface ResolveAnimationFrameDelayOptions {
  useSourceFrameDelays: boolean;
  gifMaxFps: number;
  fallbackDelayMs: number;
}

/**
 * Resolve frame delay for preview/export playback.
 * Keeps behavior consistent across app surfaces and share URLs.
 */
export function resolveAnimationFrameDelay(
  frames: AnimationFrame[],
  frameIndex: number,
  options: ResolveAnimationFrameDelayOptions
): number {
  const { useSourceFrameDelays, gifMaxFps, fallbackDelayMs } = options;

  if (!useSourceFrameDelays || frames.length === 0) {
    return fallbackDelayMs;
  }

  const sourceDelay = frames[frameIndex]?.delay || fallbackDelayMs;
  const minDelayMs = gifMaxFps > 0 ? Math.floor(1000 / gifMaxFps) : 0;
  return Math.max(sourceDelay, minDelayMs);
}
