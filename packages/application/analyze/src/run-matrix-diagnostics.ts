import type { QRAnalysisResult } from "@/contracts/analyze";
import { createQRInstance } from "@/domain/qr/encode";
import type { MatrixDiagnostics } from "./matrix-diagnostics.types";
import { buildOriginalMatrix } from "./build-original-matrix";
import { buildRegenMatrix } from "./build-regen-matrix";
import { findBestMatrixShift } from "./canvas-analysis-helpers";
import { diffMatrices } from "./diff-matrices";

export function runMatrixDiagnostics(
  qr: ReturnType<typeof createQRInstance>,
  result: QRAnalysisResult,
  moduleCount: number,
  isGeneratorSource: boolean,
  generatedCanvas: HTMLCanvasElement | OffscreenCanvas | null | undefined,
  marginModules: number,
  modulePx: number,
): MatrixDiagnostics {
  const regenMatrix = buildRegenMatrix(qr, moduleCount);
  const originalMatrix = buildOriginalMatrix(
    isGeneratorSource,
    generatedCanvas,
    moduleCount,
    marginModules,
    modulePx,
  );
  return {
    regenVsDecoded: result.moduleMatrix ? diffMatrices(result.moduleMatrix, regenMatrix) : null,
    regenVsOriginal: originalMatrix ? diffMatrices(originalMatrix, regenMatrix) : null,
    bestShift: originalMatrix
      ? findBestMatrixShift(originalMatrix, regenMatrix, moduleCount)
      : null,
  };
}
