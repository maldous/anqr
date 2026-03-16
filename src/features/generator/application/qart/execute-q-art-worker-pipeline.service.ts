/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Full QArt worker pipeline orchestration.
 */

import { createLogger } from "@/infra/logging/logger";
import type {
  FullQArtPipelineResult,
  QArtModule,
} from "@/features/generator/application/qart/qart-shared-types";
import { localizeQArtProgressStage } from "@/features/generator/application/generation/localize-q-art-progress-stage.service";
import { getQArtSearchAttempts } from "@/features/generator/application/generation/get-q-art-search-attempts.service";
import { safeMark } from "@/features/generator/application/generation/safe-mark.service";
import { safeMeasure } from "@/features/generator/application/generation/safe-measure.service";
import { renderQArtResultToCanvas } from "@/features/generator/application/qart/render-q-art-result-to-canvas.service";
import { runQArtWorkerGeneration } from "@/features/generator/application/qart/run-q-art-worker-generation.service";

const log = createLogger("QR");

export async function executeQArtWorkerPipeline(params: {
  qartModule: QArtModule;
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas;
  debouncedConfig: Record<string, unknown>;
  qartAbortController: AbortController;
  isStaleRequest: () => boolean;
  yieldForResponsiveness: () => Promise<boolean>;
  updateGenerationProgress: (stage: string, percent: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (...args: any[]) => any;
  translateQArtStage: (s: string) => string;
  qartPreviewBitmapCanvasRef: { current: HTMLCanvasElement | null };
  requestId: number;
}): Promise<{
  useFullQArt: boolean;
  fullQArtCanvas: HTMLCanvasElement | null;
  qartResultVersion: number;
  qartResultMaskPattern: number;
  qartResultModuleCount: number;
  qartResultSource: "worker" | "main";
  qartComputeMs: number | null;
  qartRequestMarked: boolean;
  workerPackedMatrix: Uint8Array | null;
  usedWorkerBitmapRender: boolean;
  qartPerfMarkPrefix: string;
  qartRequestMark: string;
  qartResultMark: string;
  qartRenderMark: string;
  aborted: boolean;
}> {
  let useFullQArt = false;
  let fullQArtCanvas: HTMLCanvasElement | null = null;
  let qartResultVersion = 0;
  let qartResultMaskPattern = 0;
  let qartResultModuleCount = 0;
  let qartResultSource: "worker" | "main" = "main";
  let qartComputeMs: number | null = null;
  let qartRequestMarked = false;
  let workerPackedMatrix: Uint8Array | null = null;
  let workerRenderedBitmap: ImageBitmap | null = null;
  let usedWorkerBitmapRender = false;

  const qartPerfMarkPrefix = `anqr:qart:${params.requestId}`;
  const qartRequestMark = `${qartPerfMarkPrefix}:request`;
  const qartResultMark = `${qartPerfMarkPrefix}:result`;
  const qartRenderMark = `${qartPerfMarkPrefix}:render`;

  const mkResult = (aborted: boolean) => ({
    useFullQArt,
    fullQArtCanvas,
    qartResultVersion,
    qartResultMaskPattern,
    qartResultModuleCount,
    qartResultSource,
    qartComputeMs,
    qartRequestMarked,
    workerPackedMatrix,
    usedWorkerBitmapRender,
    qartPerfMarkPrefix,
    qartRequestMark,
    qartResultMark,
    qartRenderMark,
    aborted,
  });

  try {
    if (await params.yieldForResponsiveness()) return mkResult(true);
    const useAutoMask =
      typeof params.debouncedConfig.maskPattern !== "number" ||
      params.debouncedConfig.maskPattern < 0;
    const qartConfig = {
      data: params.debouncedConfig.content as string,
      version: (params.debouncedConfig.typeNumber as number) || 0,
      ecc: ((params.debouncedConfig.errorCorrection as string) || "M") as "L" | "M" | "Q" | "H",
      strictSuffix: true,
      targetControlPercent: 100,
      searchAttempts: getQArtSearchAttempts(params.debouncedConfig.qrartIterations as number),
      searchSeed: (params.debouncedConfig.qrartSeed as number) ?? 0,
      lockVersionToMinimum: (params.debouncedConfig.typeNumber as number) === 0,
      performanceProfile: "quality" as const,
      onProgress: (stage: string, percent: number) => {
        const localizedStage = localizeQArtProgressStage(
          stage,
          params.translateQArtStage,
          params.t as unknown as (...args: unknown[]) => string,
        );
        params.updateGenerationProgress(localizedStage, 18 + percent * 0.64);
        log.debug("QR-Art progress", { stage: localizedStage, percent: `${percent}%` });
      },
    };

    safeMark(qartRequestMark);
    qartRequestMarked = true;

    let fullQArtResult: FullQArtPipelineResult;
    try {
      const workerGenResult = await runQArtWorkerGeneration({
        qartModule: params.qartModule,
        qartConfig,
        overlayCanvas: params.overlayCanvas,
        debouncedConfig: params.debouncedConfig,
        useAutoMask,
        qartAbortSignal: params.qartAbortController.signal,
      });
      fullQArtResult = workerGenResult.result;
      qartResultSource = workerGenResult.source;
      workerPackedMatrix = workerGenResult.packedMatrix;
      workerRenderedBitmap = workerGenResult.bitmap;
    } catch (error_) {
      if (params.qartAbortController.signal.aborted || params.isStaleRequest()) {
        return mkResult(true);
      }
      throw error_;
    }

    safeMark(qartResultMark);
    if (qartRequestMarked) {
      qartComputeMs = safeMeasure(`${qartPerfMarkPrefix}:compute`, qartRequestMark, qartResultMark);
    }
    qartResultVersion = fullQArtResult.version ?? 0;
    qartResultMaskPattern = fullQArtResult.maskPattern ?? 0;
    qartResultModuleCount = fullQArtResult.moduleCount ?? 0;

    if (fullQArtResult.success && fullQArtResult.encodedData) {
      log.info("Full QR-Art generation successful", {
        matchPercentage: `${fullQArtResult.matchPercentage.toFixed(1)}%`,
        matchingPixels: fullQArtResult.matchingPixels,
        totalControllable: fullQArtResult.totalControllable,
        version: fullQArtResult.version,
        maskPattern: fullQArtResult.maskPattern,
        encodedData: fullQArtResult.encodedData,
        source: qartResultSource,
        computeMs: qartComputeMs === null ? null : Math.round(qartComputeMs),
      });

      try {
        const renderResult = await renderQArtResultToCanvas({
          fullQArtResult,
          workerRenderedBitmap,
          workerPackedMatrix,
          debouncedConfig: params.debouncedConfig,
          bitmapCanvasRef: params.qartPreviewBitmapCanvasRef,
          updateGenerationProgress: params.updateGenerationProgress,
          t: params.t,
        });
        fullQArtCanvas = renderResult.canvas;
        usedWorkerBitmapRender = renderResult.usedBitmapRender;
        workerRenderedBitmap = null;
        useFullQArt = true;
      } catch (error_) {
        log.error("Failed to render QR-Art matrix", { error: error_ });
      }
    } else if (fullQArtResult.success) {
      log.warn("QR-Art succeeded but encodedData is missing");
    } else {
      log.warn("Full QR-Art generation failed", {
        error: fullQArtResult.error,
        source: qartResultSource,
      });
    }
  } catch (err) {
    log.warn("Full QR-Art generation threw error, falling back to fragment search", {
      error: err,
    });
  }

  return mkResult(false);
}
