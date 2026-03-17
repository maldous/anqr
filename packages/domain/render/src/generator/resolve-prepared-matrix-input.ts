import type {
  CreateCanvasFn,
  PixelDecisionMatrix,
  QRCodeInstance,
  QRGeneratorConfig,
} from "./types";
import { generateBWFirstMatrix } from "./generate-bw-first-matrix";
import { log } from "./log";
import { resolveMatrixInput } from "./resolve-matrix-input";

export async function resolvePreparedMatrixInput(
  params: Readonly<{
    config: QRGeneratorConfig;
    createCanvasFn: CreateCanvasFn;
    effectiveIntensity: number;
    modeLabel: string;
    moduleCount: number;
    overlayCanvas: HTMLCanvasElement | OffscreenCanvas;
    qr: QRCodeInstance;
    releaseCanvasFn?: (canvas: HTMLCanvasElement | OffscreenCanvas) => void;
    scale: number;
  }>,
): Promise<
  | { matrix: PixelDecisionMatrix; matrixInput: null }
  | {
      matrix: null;
      matrixInput: Exclude<
        Awaited<ReturnType<typeof resolveMatrixInput>>,
        { emptyMatrix: PixelDecisionMatrix }
      >;
    }
> {
  if (params.config.qrFirstMode) {
    log.debug(
      `QR-first mode enabled via config in ${params.modeLabel} mode - using QR-first matrix`,
    );
    return {
      matrix: await generateBWFirstMatrix(
        params.qr,
        params.config,
        params.overlayCanvas,
        params.moduleCount,
        params.scale,
        params.effectiveIntensity,
        params.createCanvasFn,
        params.releaseCanvasFn,
      ),
      matrixInput: null,
    };
  }

  const matrixInput = await resolveMatrixInput({
    createCanvasFn: params.createCanvasFn,
    effectiveIntensity: params.effectiveIntensity,
    moduleCount: params.moduleCount,
    overlayCanvas: params.overlayCanvas,
    releaseCanvasFn: params.releaseCanvasFn,
    scale: params.scale,
  });

  if ("emptyMatrix" in matrixInput) {
    return { matrix: matrixInput.emptyMatrix, matrixInput: null };
  }

  return { matrix: null, matrixInput };
}
