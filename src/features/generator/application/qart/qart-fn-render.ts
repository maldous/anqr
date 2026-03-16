/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Render QArt result to canvas element.
 */

import type { FullQArtPipelineResult } from "@/features/generator/application/qart/qart-shared-types";
import type { QRGeneratorConfig } from "@/modules/qr-generator";
import { imageBitmapToCanvas } from "@/features/generator/application/generation/generation-fn-bitmaptocanvas";
import { qrGenerator } from "@/features/generator/application/generation/generation-singleton";

export async function renderQArtResultToCanvas(params: {
  fullQArtResult: FullQArtPipelineResult;
  workerRenderedBitmap: ImageBitmap | null;
  workerPackedMatrix: Uint8Array | null;
  debouncedConfig: Record<string, unknown>;
  bitmapCanvasRef: { current: HTMLCanvasElement | null };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateGenerationProgress: (...args: any[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (...args: any[]) => any;
}): Promise<{ canvas: HTMLCanvasElement | null; usedBitmapRender: boolean }> {
  const qrArtConfig = {
    ...params.debouncedConfig,
    typeNumber: params.fullQArtResult.version,
    overlayMode: undefined,
  } as QRGeneratorConfig;
  params.updateGenerationProgress(
    params.t("preview.busy.renderingQrPreview", "Rendering your QR preview..."),
    86,
  );
  if (params.workerRenderedBitmap) {
    const canvas = imageBitmapToCanvas(
      params.workerRenderedBitmap,
      params.bitmapCanvasRef.current ?? undefined,
    );
    params.bitmapCanvasRef.current = canvas;
    if (typeof params.workerRenderedBitmap.close === "function") {
      params.workerRenderedBitmap.close();
    }
    return { canvas: canvas, usedBitmapRender: true };
  }
  if (params.workerPackedMatrix && (params.fullQArtResult.moduleCount ?? 0) > 0) {
    const canvas = (await qrGenerator.renderFromPackedMatrix(
      params.workerPackedMatrix,
      params.fullQArtResult.moduleCount ?? 0,
      qrArtConfig,
    )) as HTMLCanvasElement;
    return { canvas, usedBitmapRender: false };
  }
  const canvas = (await qrGenerator.renderFromMatrix(
    params.fullQArtResult.matrix ?? [],
    qrArtConfig,
  )) as HTMLCanvasElement;
  return { canvas, usedBitmapRender: false };
}
