/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Generate artwork frame in standalone mode.
 */

import { createLogger } from "@/infra/logging/logger";
import type { QArtModule } from "../qart/qart-shared-types";
import type { QRGeneratorConfig } from "@/modules/qr-generator";
import { makeArtworkFrameHelpers } from "./make-artwork-frame-helpers.service";
import { handleArtworkWorkerSuccess } from "./handle-artwork-worker-success.service";
import { invokeArtworkWorkerForFrame } from "./invoke-artwork-worker-for-frame.service";
import { isNoisyOutlierMatchCheck } from "./is-noisy-outlier-match-check.service";
import type { ArtworkFrameState } from "./frames-artworkstate.types";
import { getQArtSearchAttempts } from "../generation/get-q-art-search-attempts.service";
import { resolveArtworkMaskPattern } from "../safety/resolve-artwork-mask-pattern.service";

const log = createLogger("QR");

export async function generateArtworkFrameStandalone(params: {
  frameOverlayCanvas: HTMLCanvasElement | OffscreenCanvas;
  frameIdx: number;
  artworkState: ArtworkFrameState;
  qartModule: QArtModule | null;
  debouncedConfig: Record<string, unknown>;
  previewScanConfigBase: QRGeneratorConfig;
  abortSignal: AbortSignal;
  isRunCancelled: () => boolean;
}): Promise<HTMLCanvasElement | OffscreenCanvas | null> {
  const { reuseLastSuccessfulFrame, rememberSuccessfulFrame, fallbackGenerate } =
    makeArtworkFrameHelpers({
      artworkState: params.artworkState,
      previewScanConfigBase: params.previewScanConfigBase,
      frameOverlayCanvas: params.frameOverlayCanvas,
      frameIdx: params.frameIdx,
    });
  const isNoisyOutlierMatch = (mp: number): boolean =>
    isNoisyOutlierMatchCheck(
      mp,
      params.frameIdx,
      params.artworkState.lastSuccessfulArtworkMatchPercentage,
    );

  try {
    const useAutoMask =
      typeof params.debouncedConfig.maskPattern !== "number" ||
      params.debouncedConfig.maskPattern < 0;
    const qartConfig = {
      data: (params.debouncedConfig.content as string) ?? "",
      version: params.artworkState.artworkLockedVersion,
      ecc: ((params.debouncedConfig.errorCorrection as string) || "M") as "L" | "M" | "Q" | "H",
      strictSuffix: true,
      targetControlPercent: 100,
      searchAttempts: getQArtSearchAttempts(params.debouncedConfig.qrartIterations as number),
      searchSeed: (params.debouncedConfig.qrartSeed as number) ?? 0,
      lockVersionToMinimum:
        (params.debouncedConfig.typeNumber as number) === 0 && params.frameIdx === 0,
      performanceProfile: "quality" as const,
    };

    const workerRenderConfig: Record<string, unknown> = {
      ...params.artworkState.artworkRenderConfigTemplate,
      typeNumber: params.artworkState.artworkLockedVersion,
    };

    if (!params.qartModule) {
      return await fallbackGenerate();
    }

    const resolvedMask = resolveArtworkMaskPattern(
      useAutoMask,
      params.artworkState.artworkLockedMask,
      params.debouncedConfig.maskPattern as number,
    );

    const workerOutcome = await invokeArtworkWorkerForFrame({
      qartModule: params.qartModule,
      qartConfig,
      workerRenderConfig,
      resolvedMask,
      artworkState: params.artworkState,
      frameOverlayCanvas: params.frameOverlayCanvas,
      frameIdx: params.frameIdx,
      abortSignal: params.abortSignal,
      isRunCancelled: params.isRunCancelled,
      debouncedConfig: params.debouncedConfig,
      useAutoMask,
      reuseLastSuccessfulFrame,
      fallbackGenerate,
      rememberSuccessfulFrame,
    });
    if ("fallbackCanvas" in workerOutcome) return workerOutcome.fallbackCanvas;

    const { workerResult } = workerOutcome;
    if (workerResult.success) {
      const successResult = await handleArtworkWorkerSuccess({
        workerResult,
        frameIdx: params.frameIdx,
        artworkState: params.artworkState,
        debouncedConfig: params.debouncedConfig,
        isNoisyOutlierMatch,
        qartModule: params.qartModule,
        qartConfig,
        workerRenderConfig,
        resolvedMask,
        signal: params.abortSignal,
        isRunCancelled: params.isRunCancelled,
        getArtworkFrameTargetImage: params.artworkState.getArtworkFrameTargetImage,
        frameOverlayCanvas: params.frameOverlayCanvas,
        rememberSuccessfulFrame,
      });
      if (successResult) return successResult;
    } else {
      log.warn("QR-Art failed for animation frame", {
        frameIdx: params.frameIdx,
        error: workerResult.error,
      });
      const preserved = reuseLastSuccessfulFrame();
      if (preserved) return preserved;
    }
  } catch (err) {
    log.warn("QR-Art frame generation failed, falling back to standard", {
      frameIdx: params.frameIdx,
      error: err,
    });
    const preserved = reuseLastSuccessfulFrame();
    if (preserved) return preserved;
  }
  return await fallbackGenerate();
}
