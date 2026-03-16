import type { InterpolationMode } from './animation-patterns.types';
import { applyEasing } from './apply-easing';
import { blendFramePixels } from './blend-frame-pixels';

/**
 * Interpolate between frames with easing
 */
export function interpolateAnimationFramesWithEasing(
  frames: HTMLCanvasElement[],
  targetCount: number,
  mode: InterpolationMode = 'linear'
): HTMLCanvasElement[] {
  if (frames.length === 0) return [];
  if (frames.length === 1 || targetCount <= frames.length) {
    return frames.slice(0, targetCount);
  }

  const result: HTMLCanvasElement[] = [];
  const width = frames[0].width;
  const height = frames[0].height;
  const framePixels = Array.from<Uint8ClampedArray | null>({ length: frames.length });
  for (let i = 0; i < frames.length; i++) {
    const frameCtx =
      (frames[i]?.getContext('2d', {
        willReadFrequently: true,
        desynchronized: true,
      } as CanvasRenderingContext2DSettings | undefined) as CanvasRenderingContext2D | null) ??
      frames[i]?.getContext('2d');
    framePixels[i] = frameCtx ? frameCtx.getImageData(0, 0, width, height).data : null;
  }

  const blendPixels = new Uint8ClampedArray(width * height * 4);
  const reusableBlendData = new ImageData(blendPixels, width, height);

  for (let i = 0; i < targetCount; i++) {
    const t = i / (targetCount - 1);
    const easedT = applyEasing(t, mode);
    const sourcePos = easedT * (frames.length - 1);
    const frameA = Math.floor(sourcePos);
    const frameB = Math.min(frameA + 1, frames.length - 1);
    const blend = sourcePos - frameA;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    if (blend === 0 || frameA === frameB) {
      ctx.drawImage(frames[frameA], 0, 0);
    } else {
      // Blend between frames
      const sourceA = framePixels[frameA];
      const sourceB = framePixels[frameB];
      if (!(sourceA && sourceB)) {
        ctx.drawImage(frames[frameA], 0, 0);
        result.push(canvas);
        continue;
      }

      blendFramePixels(sourceA, sourceB, blend, blendPixels);
      ctx.putImageData(reusableBlendData, 0, 0);
    }

    result.push(canvas);
  }

  return result;
}
