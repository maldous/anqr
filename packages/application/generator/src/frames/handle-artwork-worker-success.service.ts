/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Handle successful artwork worker result.
 */

import { createLogger } from "@/domain/logging";
import type { QArtModule, QArtWorkerResult } from "../qart/qart-shared-types";
import { renderArtworkWorkerBitmap } from "./render-artwork-worker-bitmap.service";
import { renderArtworkWorkerMatrix } from "./render-artwork-worker-matrix.service";
import type { ArtworkFrameState } from "./frames-artworkstate.types";
import { rescueOutlierArtworkFrame } from "../safety/rescue-outlier-artwork-frame.service";

const log = createLogger("QR");

export async function handleArtworkWorkerSuccess(params: {
  workerResult: QArtWorkerResult;
  frameIdx: number;
  artworkState: ArtworkFrameState;
  debouncedConfig: Record<string, unknown>;
  isNoisyOutlierMatch: (mp: number) => boolean;
  qartModule: QArtModule;
  qartConfig: Record<string, unknown>;
  workerRenderConfig: Record<string, unknown>;
  resolvedMask: number | undefined;
  signal: AbortSignal;
  isRunCancelled: () => boolean;
  getArtworkFrameTargetImage: (c: HTMLCanvasElement | OffscreenCanvas, fi: number) => ImageData;
  frameOverlayCanvas: HTMLCanvasElement | OffscreenCanvas;
  rememberSuccessfulFrame: (f: HTMLCanvasElement | OffscreenCanvas, mp: number) => void;
}): Promise<HTMLCanvasElement | OffscreenCanvas | null> {
  let effectiveWorkerResult = params.workerResult;
  if (params.isNoisyOutlierMatch(params.workerResult.matchPercentage)) {
    const rescueAttempts = Math.min(
      8,
      Math.max((params.qartConfig.searchAttempts as number) + 2, 4),
    );
    const rescueSeed =
      (((params.qartConfig.searchSeed as number) ?? 0) ^
        Math.imul(params.frameIdx + 1, 0x85ebca6b)) >>>
      0;
    log.warn("QR-Art frame quality outlier detected; retrying frame", {
      frameIdx: params.frameIdx,
      previousMatch: params.artworkState.lastSuccessfulArtworkMatchPercentage,
      currentMatch: params.workerResult.matchPercentage,
      rescueAttempts,
    });
    try {
      effectiveWorkerResult = await rescueOutlierArtworkFrame({
        qartModule: params.qartModule,
        qartConfig: params.qartConfig,
        workerRenderConfig: params.workerRenderConfig,
        targetImage: params.getArtworkFrameTargetImage(params.frameOverlayCanvas, params.frameIdx),
        originalResult: params.workerResult,
        searchAttempts: rescueAttempts,
        rescueSeed,
        maskPattern: params.resolvedMask,
        signal: params.signal,
        isRunCancelled: params.isRunCancelled,
      });
    } catch {
      return null;
    }
  }

  if (params.frameIdx === 0) {
    params.artworkState.setLockedMask(effectiveWorkerResult.maskPattern);
    params.artworkState.setLockedVersion(effectiveWorkerResult.version);
  }

  const bitmapRendered = renderArtworkWorkerBitmap({
    workerResult: effectiveWorkerResult,
    getScratchCanvas: params.artworkState.getArtworkBitmapScratchCanvas,
    frameIdx: params.frameIdx,
  });
  if (bitmapRendered) {
    params.rememberSuccessfulFrame(bitmapRendered, effectiveWorkerResult.matchPercentage);
    return bitmapRendered;
  }

  const matrixRendered = await renderArtworkWorkerMatrix({
    workerResult: effectiveWorkerResult,
    debouncedConfig: params.debouncedConfig,
  });
  if (matrixRendered) {
    params.rememberSuccessfulFrame(matrixRendered, effectiveWorkerResult.matchPercentage);
    return matrixRendered;
  }

  return null;
}
