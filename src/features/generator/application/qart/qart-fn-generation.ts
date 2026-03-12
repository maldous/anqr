/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Top-level QArt generation entry point.
 */

import { createLogger } from '@/infra/logging/logger';
import { loadQArtModule } from '@/features/generator/application/qart/qart-shared-state';
import { QArtPerfSnapshot } from '@/features/generator/application/generation/generation-type-perfsnap';
import { deliverQArtResult } from '@/features/generator/application/qart/qart-fn-deliver';
import { executeQArtWorkerPipeline } from '@/features/generator/application/qart/qart-fn-pipeline';

const log = createLogger('QR');


export async function runQArtGeneration(params: {
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas;
  debouncedConfig: Record<string, unknown>;
  qartAbortController: AbortController;
  isStaleRequest: () => boolean;
  yieldForResponsiveness: () => Promise<boolean>;
  updateGenerationProgress: (stage: string, percent: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (...args: any[]) => any;
  translateQArtStage: (s: string) => string;
  watermark: {
    enabled: boolean;
    kind: string;
    text: string;
    image: File | null;
    position: string;
    opacity: number;
    blend: string;
  };
  canvasRef: { current: HTMLCanvasElement | null };
  setCanvas: (c: HTMLCanvasElement | OffscreenCanvas | null) => void;
  qrPackedMatrixRef: { current: { packed: Uint8Array; moduleCount: number } | null };
  setQrMatrix: (m: boolean[][] | null) => void;
  setIsRendering: (v: boolean) => void;
  setIsLoading: (v: boolean) => void;
  clearGenerationProgress: () => void;
  qartPreviewBitmapCanvasRef: { current: HTMLCanvasElement | null };
  effectiveConfig: Record<string, unknown>;
  runValidationIfNeeded: (
    c: HTMLCanvasElement | OffscreenCanvas,
    content: string | undefined
  ) => void;
  setQArtPerfSnapshot: (s: QArtPerfSnapshot) => void;
  requestId: number;
}): Promise<{ handled: boolean }> {
  const qartModule = await loadQArtModule();
  if (params.isStaleRequest()) return { handled: true };
  params.updateGenerationProgress(
    params.t('preview.busy.preparingQrArtComputation', 'Preparing QR-Art computation...'),
    18
  );
  log.info('Starting QR-Art generation', {
    content: (params.debouncedConfig.content as string)?.substring(0, 50),
    version: params.debouncedConfig.typeNumber,
    ecc: params.debouncedConfig.errorCorrection,
  });

  const pipeline = await executeQArtWorkerPipeline({
    qartModule,
    overlayCanvas: params.overlayCanvas,
    debouncedConfig: params.debouncedConfig,
    qartAbortController: params.qartAbortController,
    isStaleRequest: params.isStaleRequest,
    yieldForResponsiveness: params.yieldForResponsiveness,
    updateGenerationProgress: params.updateGenerationProgress,
    t: params.t,
    translateQArtStage: params.translateQArtStage,
    qartPreviewBitmapCanvasRef: params.qartPreviewBitmapCanvasRef,
    requestId: params.requestId,
  });

  if (pipeline.aborted) return { handled: true };

  if (pipeline.useFullQArt && pipeline.fullQArtCanvas) {
    return deliverQArtResult({
      fullQArtCanvas: pipeline.fullQArtCanvas,
      watermark: params.watermark,
      isStaleRequest: params.isStaleRequest,
      canvasRef: params.canvasRef,
      setCanvas: params.setCanvas,
      updateGenerationProgress: params.updateGenerationProgress,
      t: params.t,
      qartRequestMarked: pipeline.qartRequestMarked,
      qartPerfMarkPrefix: pipeline.qartPerfMarkPrefix,
      qartRequestMark: pipeline.qartRequestMark,
      qartResultMark: pipeline.qartResultMark,
      qartRenderMark: pipeline.qartRenderMark,
      qartComputeMs: pipeline.qartComputeMs,
      qartResultSource: pipeline.qartResultSource,
      qartResultVersion: pipeline.qartResultVersion,
      qartResultMaskPattern: pipeline.qartResultMaskPattern,
      qartResultModuleCount: pipeline.qartResultModuleCount,
      usedWorkerBitmapRender: pipeline.usedWorkerBitmapRender,
      workerPackedMatrix: pipeline.workerPackedMatrix,
      qrPackedMatrixRef: params.qrPackedMatrixRef,
      setQrMatrix: params.setQrMatrix,
      effectiveConfig: params.effectiveConfig,
      runValidationIfNeeded: params.runValidationIfNeeded,
      setQArtPerfSnapshot: params.setQArtPerfSnapshot,
      setIsRendering: params.setIsRendering,
      setIsLoading: params.setIsLoading,
      clearGenerationProgress: params.clearGenerationProgress,
    });
  }

  return { handled: false };
}

