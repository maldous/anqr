/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Finalize generated canvas with watermark and validation.
 */

import { drawToDisplayCanvas } from "./draw-to-display-canvas.service";
import { applyWatermarkToCanvas } from "./apply-watermark-to-canvas.service";
import { qrGenerator } from "./generation-singleton";

export async function finalizeGeneratedCanvas(params: {
  result: HTMLCanvasElement | OffscreenCanvas | null;
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
  setCanvas: (c: HTMLCanvasElement | OffscreenCanvas | null) => void;
  updateGenerationProgress: (stage: string, percent: number) => void;

  t: (...args: any[]) => any;
  qrPackedMatrixRef: { current: { packed: Uint8Array; moduleCount: number } | null };
  setQrMatrix: (m: boolean[][] | null) => void;
  canvasRef: { current: HTMLCanvasElement | null };
  runValidationIfNeeded: (
    c: HTMLCanvasElement | OffscreenCanvas,
    content: string | undefined,
  ) => void;
  effectiveConfig: Record<string, unknown>;
}): Promise<void> {
  let result = params.result;
  if (result) {
    result = await applyWatermarkToCanvas(result, params.watermark);
  }

  if (params.isStaleRequest()) return;
  params.setCanvas(result);
  params.updateGenerationProgress(
    params.t("preview.busy.finalizingPreview", "Finalizing the preview..."),
    92,
  );

  const matrixData = qrGenerator.getLastMatrix();
  if (matrixData) {
    params.qrPackedMatrixRef.current = null;
    params.setQrMatrix(matrixData.matrix);
  }

  if (params.canvasRef.current && result) {
    drawToDisplayCanvas(params.canvasRef.current, result);
  }

  if (result) {
    params.updateGenerationProgress(
      params.t("preview.busy.checkingScanability", "Checking that it scans properly..."),
      98,
    );
    params.runValidationIfNeeded(result, params.effectiveConfig.content as string);
  }
}
