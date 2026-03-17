/**
 * GIF Compositor - Optimal patch-only decode
 */

import { createLogger } from "../../../infra/logging/logger";
import { getOrCreatePatchImageData } from "./get-or-create-patch-image-data";
import { getGifFrameStats } from "./gif-frame-stats";

const log = createLogger("ANIMATION");

import { decodeGif } from "./gif-codec";
import type { GifCompositor } from "../../../modules/animation/types";

/**
 * Create a GIF compositor from an ArrayBuffer.
 * Uses patch-only decode for minimal memory usage.
 */
export function createGifCompositor(arrayBuffer: ArrayBuffer): GifCompositor {
  const { width, height, frames } = decodeGif(arrayBuffer);

  const { uniqueDelays, uniqueDisposals, totalDurationMs } = getGifFrameStats(frames);
  const hasDeltaPatches = frames.some(
    (f) =>
      f.dims.left !== 0 || f.dims.top !== 0 || f.dims.width !== width || f.dims.height !== height,
  );

  log.debug("compositor: created", {
    width,
    height,
    frameCount: frames.length,
    uniqueDelaysMs: uniqueDelays,
    hasConstantDelay: uniqueDelays.length <= 1,
    uniqueDisposals,
    disposalPattern:
      uniqueDisposals.length <= 1
        ? `uniform(${uniqueDisposals[0] ?? 0})`
        : `mixed(${uniqueDisposals.join(",")})`,
    hasDeltaPatches,
    totalDurationMs,
    avgFps:
      totalDurationMs > 0 ? Math.round((frames.length / totalDurationMs) * 1000 * 10) / 10 : 0,
  });

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const _ctx =
    canvas.getContext("2d", {
      willReadFrequently: true,
      desynchronized: true,
    }) ?? canvas.getContext("2d");
  if (!_ctx) {
    throw new Error("Failed to get 2D context for GIF compositor canvas");
  }
  const ctx: CanvasRenderingContext2D = _ctx;

  let maxPatchW = 0;
  let maxPatchH = 0;
  for (const f of frames) {
    maxPatchW = Math.max(maxPatchW, f.dims.width);
    maxPatchH = Math.max(maxPatchH, f.dims.height);
  }
  const patchCanvas = document.createElement("canvas");
  patchCanvas.width = maxPatchW;
  patchCanvas.height = maxPatchH;
  const patchCtx =
    patchCanvas.getContext("2d", {
      willReadFrequently: true,
      desynchronized: true,
    }) ?? patchCanvas.getContext("2d");
  const patchImageDataCache: Array<ImageData | null> = Array.from(
    { length: frames.length },
    () => null,
  );
  const patchBitmapCache: Array<ImageBitmap | null> = Array.from(
    { length: frames.length },
    () => null,
  );
  const patchBitmapPromiseCache: Array<Promise<void> | null> = Array.from(
    { length: frames.length },
    () => null,
  );
  const canCreateBitmap = typeof createImageBitmap === "function";

  let restoreData: { x: number; y: number; w: number; h: number; data: ImageData } | null = null;

  function apply(i: number): void {
    if (i < 0 || i >= frames.length) return;

    // Clear canvas on first frame to ensure clean slate and prevent ghosting
    // from previous animation cycles or stale content
    if (i === 0) {
      ctx.clearRect(0, 0, width, height);
      restoreData = null;
    }

    const f = frames[i];
    const { left, top, width: w, height: h } = f.dims;

    log.trace("compositor: apply", {
      frame: i,
      dims: { left, top, w, h },
      disposalType: f.disposalType,
      delayMs: f.delay,
      isFullFrame: left === 0 && top === 0 && w === width && h === height,
    });

    if (f.disposalType === 3) {
      restoreData = {
        x: left,
        y: top,
        w,
        h,
        data: ctx.getImageData(left, top, w, h),
      };
    } else {
      restoreData = null;
    }

    if (canCreateBitmap) {
      const bitmap = patchBitmapCache[i];
      if (bitmap) {
        ctx.drawImage(bitmap, left, top, w, h);
        return;
      }
      if (!patchBitmapPromiseCache[i]) {
        const imageData = getOrCreatePatchImageData(patchImageDataCache, i, f.patch, w, h);
        patchBitmapPromiseCache[i] = createImageBitmap(imageData)
          .then((created) => {
            patchBitmapCache[i] = created;
          })
          .catch(() => {
            patchBitmapCache[i] = null;
          });
      }
    }

    if (patchCtx) {
      patchCtx.clearRect(0, 0, w, h);
      const imageData = getOrCreatePatchImageData(patchImageDataCache, i, f.patch, w, h);
      patchCtx.putImageData(imageData, 0, 0);
      ctx.drawImage(patchCanvas, 0, 0, w, h, left, top, w, h);
    }
  }

  function dispose(i: number): void {
    if (i < 0 || i >= frames.length) return;

    const f = frames[i];
    const { left, top, width: w, height: h } = f.dims;

    let disposalAction = "none";
    if (f.disposalType === 2) disposalAction = "clearRect";
    else if (f.disposalType === 3) disposalAction = "restorePrevious";
    log.trace("compositor: dispose", {
      frame: i,
      disposalType: f.disposalType,
      action: disposalAction,
    });

    switch (f.disposalType) {
      case 2:
        ctx.clearRect(left, top, w, h);
        break;
      case 3:
        if (restoreData) {
          ctx.putImageData(restoreData.data, restoreData.x, restoreData.y);
        }
        break;
    }
  }

  function reset(): void {
    log.trace("compositor: reset");
    ctx.clearRect(0, 0, width, height);
    restoreData = null;
  }

  /**
   * Get a snapshot (copy) of the current canvas state.
   * Use this when you need to store or pass the frame to avoid reference issues.
   */
  function getSnapshot(): HTMLCanvasElement {
    const snapshot = document.createElement("canvas");
    snapshot.width = width;
    snapshot.height = height;
    const snapshotCtx = snapshot.getContext("2d");
    if (snapshotCtx) {
      snapshotCtx.drawImage(canvas, 0, 0);
    }
    return snapshot;
  }

  return {
    canvas,
    frameCount: frames.length,
    width,
    height,
    delayMs: (i: number) => Math.max(frames[i]?.delay || 100, 10),
    disposalType: (i: number) => frames[i]?.disposalType ?? 0,
    frameDims: (i: number) => frames[i]?.dims ?? { left: 0, top: 0, width: 0, height: 0 },
    apply,
    dispose,
    reset,
    getSnapshot,
  };
}
