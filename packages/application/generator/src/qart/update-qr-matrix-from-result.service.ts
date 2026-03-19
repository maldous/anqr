/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Update QR matrix state from QArt result.
 */

import { getQRGenerator } from "../generation/generation-singleton";

export function updateQrMatrixFromResult(params: {
  usedWorkerBitmapRender: boolean;
  workerPackedMatrix: Uint8Array | null;
  qartResultSource: "worker" | "main";
  qartResultModuleCount: number;
  qrPackedMatrixRef: { current: { packed: Uint8Array; moduleCount: number } | null };
  setQrMatrix: (m: boolean[][] | null) => void;
}): void {
  if (
    params.usedWorkerBitmapRender &&
    params.workerPackedMatrix &&
    params.qartResultSource === "worker" &&
    params.qartResultModuleCount > 0
  ) {
    params.qrPackedMatrixRef.current = {
      packed: params.workerPackedMatrix,
      moduleCount: params.qartResultModuleCount,
    };
    params.setQrMatrix(null);
    return;
  }
  const matrixData = getQRGenerator().getLastMatrix();
  if (matrixData) {
    params.qrPackedMatrixRef.current = null;
    params.setQrMatrix(matrixData.matrix);
  }
}
