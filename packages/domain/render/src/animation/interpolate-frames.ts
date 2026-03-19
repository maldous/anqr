/**
 * Frame Interpolation
 * Interpolate between animation frames
 */

import { createLogger } from "@/domain/logging";
import { getCanvas2DContext } from "@/domain/render/canvas";
import { createCanvasLike } from "./create-canvas-like";
import { crossfadeIntoContext } from "./crossfade-into-context";
import { getMorphScratch } from "./get-morph-scratch";
import { resetCanvas2D } from "./reset-canvas-2d";

const _log = createLogger("ANIMATION");

const MAX_MORPH_PIXELS = 512 * 512;

/**
 * Interpolate between two frames
 */
export function interpolateFrames(
  frame1: HTMLCanvasElement | OffscreenCanvas,
  frame2: HTMLCanvasElement | OffscreenCanvas,
  t: number,
  mode: "none" | "crossfade" | "morph",
  targetCanvas?: HTMLCanvasElement | OffscreenCanvas,
): HTMLCanvasElement | OffscreenCanvas {
  if (mode === "none" || t === 0) return frame1 as HTMLCanvasElement;
  if (t === 1) return frame2 as HTMLCanvasElement;

  const result = createCanvasLike(frame1, targetCanvas);
  const ctx = resetCanvas2D(result);
  if (!ctx) return frame1 as HTMLCanvasElement;

  switch (mode) {
    case "crossfade": {
      crossfadeIntoContext(ctx, frame1, frame2, t);
      break;
    }

    case "morph": {
      const pixelCount = frame1.width * frame1.height;
      if (pixelCount > MAX_MORPH_PIXELS) {
        // Keep large-frame interpolation responsive by falling back to fast crossfade.
        crossfadeIntoContext(ctx, frame1, frame2, t);
        break;
      }

      const ctx1 = getCanvas2DContext(frame1, {
        willReadFrequently: true,
        desynchronized: true,
      });
      const ctx2 = getCanvas2DContext(frame2, {
        willReadFrequently: true,
        desynchronized: true,
      });
      if (!(ctx1 && ctx2)) {
        ctx.drawImage(frame1 as HTMLCanvasElement, 0, 0);
        break;
      }
      const data1 = ctx1.getImageData(0, 0, frame1.width, frame1.height);
      const data2 = ctx2.getImageData(0, 0, frame2.width, frame2.height);
      const resultData = getMorphScratch(ctx, result.width, result.height);
      const out = resultData.data;
      const src1 = data1.data;
      const src2 = data2.data;

      for (let i = 0; i < src1.length; i++) {
        out[i] = Math.round(src1[i] * (1 - t) + src2[i] * t);
      }

      ctx.putImageData(resultData, 0, 0);
      break;
    }

    default:
      ctx.drawImage(frame1 as CanvasImageSource, 0, 0);
  }

  return result;
}
