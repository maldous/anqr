import { quantizeGifPalette } from '../../../modules/animation';
import { renderFrameToScaledCtx } from './render-frame-to-scaled-ctx';
import type { ScaledCtx } from './scaled-ctx';

export function sampleGlobalPalette(
  frames: HTMLCanvasElement[],
  scaledCtx: ScaledCtx,
  width: number,
  height: number,
  hasBgOverride: string | undefined,
  bgOverride: string,
  paletteSize: number
): number[][] | null {
  if (frames.length === 0) return null;

  const framesToSample =
    frames.length > 10 ? [0, Math.floor(frames.length / 2), frames.length - 1] : [0];
  const pixelsPerFrame = width * height * 4;
  const sampledPixels = new Uint8ClampedArray(framesToSample.length * pixelsPerFrame);
  let offset = 0;

  for (const frameIdx of framesToSample) {
    const frame = frames[frameIdx];
    if (!frame) continue;
    renderFrameToScaledCtx(scaledCtx, frame, width, height, hasBgOverride, bgOverride);
    const imageData = scaledCtx.getImageData(0, 0, width, height);
    sampledPixels.set(imageData.data, offset);
    offset += imageData.data.length;
  }

  return quantizeGifPalette(sampledPixels, paletteSize);
}
