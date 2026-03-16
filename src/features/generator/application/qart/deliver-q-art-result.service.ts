/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Deliver QArt result to display and state.
 */

import { drawToDisplayCanvas } from "@/features/generator/application/generation/draw-to-display-canvas.service";
import { applyWatermarkToCanvas } from "@/features/generator/application/generation/apply-watermark-to-canvas.service";
import type { QArtPerfSnapshot } from "@/features/generator/application/generation/generation-perfsnap.types";
import { recordQArtPerfTimings } from "@/features/generator/application/qart/record-q-art-perf-timings.service";
import { updateQrMatrixFromResult } from "@/features/generator/application/qart/update-qr-matrix-from-result.service";

export async function deliverQArtResult(params: {
  fullQArtCanvas: HTMLCanvasElement;
  watermark: {
    enabled: boolean;
    kind: string;
    text: string;
    image: File | null;
    position: string;
    opacity: number;
    blend: string;
  };
  isStaleRequest: () => boolean;
  canvasRef: { current: HTMLCanvasElement | null };
  setCanvas: (c: HTMLCanvasElement | OffscreenCanvas | null) => void;
  updateGenerationProgress: (stage: string, percent: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (...args: any[]) => any;
  qartRequestMarked: boolean;
  qartPerfMarkPrefix: string;
  qartRequestMark: string;
  qartResultMark: string;
  qartRenderMark: string;
  qartComputeMs: number | null;
  qartResultSource: "worker" | "main";
  qartResultVersion: number;
  qartResultMaskPattern: number;
  qartResultModuleCount: number;
  usedWorkerBitmapRender: boolean;
  workerPackedMatrix: Uint8Array | null;
  qrPackedMatrixRef: { current: { packed: Uint8Array; moduleCount: number } | null };
  setQrMatrix: (m: boolean[][] | null) => void;
  effectiveConfig: Record<string, unknown>;
  runValidationIfNeeded: (
    c: HTMLCanvasElement | OffscreenCanvas,
    content: string | undefined,
  ) => void;
  setQArtPerfSnapshot: (s: QArtPerfSnapshot) => void;
  setIsRendering: (v: boolean) => void;
  setIsLoading: (v: boolean) => void;
  clearGenerationProgress: () => void;
}): Promise<{ handled: boolean }> {
  if (params.isStaleRequest()) return { handled: true };
  const resultCanvas = await applyWatermarkToCanvas(params.fullQArtCanvas, params.watermark);

  if (params.isStaleRequest()) return { handled: true };
  params.setCanvas(resultCanvas);
  params.updateGenerationProgress(
    params.t("preview.busy.finalizingPreview", "Finalizing the preview..."),
    96,
  );
  if (params.canvasRef.current) {
    drawToDisplayCanvas(params.canvasRef.current, resultCanvas);
  }

  const { renderMs: qartRenderMs, previewMs: qartPreviewMs } = recordQArtPerfTimings({
    qartRequestMarked: params.qartRequestMarked,
    qartPerfMarkPrefix: params.qartPerfMarkPrefix,
    qartRequestMark: params.qartRequestMark,
    qartResultMark: params.qartResultMark,
    qartRenderMark: params.qartRenderMark,
    qartComputeMs: params.qartComputeMs,
    qartResultSource: params.qartResultSource,
  });
  params.setQArtPerfSnapshot({
    source: params.qartResultSource,
    computeMs: params.qartComputeMs,
    renderMs: qartRenderMs,
    previewMs: qartPreviewMs,
    version: params.qartResultVersion,
    maskPattern: params.qartResultMaskPattern,
  });

  updateQrMatrixFromResult({
    usedWorkerBitmapRender: params.usedWorkerBitmapRender,
    workerPackedMatrix: params.workerPackedMatrix,
    qartResultSource: params.qartResultSource,
    qartResultModuleCount: params.qartResultModuleCount,
    qrPackedMatrixRef: params.qrPackedMatrixRef,
    setQrMatrix: params.setQrMatrix,
  });

  params.runValidationIfNeeded(resultCanvas, params.effectiveConfig.content as string);
  params.setIsRendering(false);
  params.setIsLoading(false);
  params.clearGenerationProgress();
  return { handled: true };
}
