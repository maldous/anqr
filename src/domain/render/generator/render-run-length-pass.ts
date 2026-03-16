import type { QRCodeInstance } from "../../../modules/qr-generator/types";
import { isRunLengthCellMatch } from "./is-run-length-cell-match";
import type { RunLengthCanvasContext } from "./run-length-canvas-context.type";

export function renderRunLengthPass(
  ctx: RunLengthCanvasContext,
  qr: QRCodeInstance,
  moduleCount: number,
  moduleSize: number,
  margin: number,
  ditherPattern: boolean[][] | null,
  skipMask: Uint8Array,
  isDarkPass: boolean,
): void {
  for (let row = 0; row < moduleCount; row++) {
    const rowBase = row * moduleCount;
    const y = (row + margin) * moduleSize;
    let runStart = -1;
    for (let col = 0; col <= moduleCount; col++) {
      const match = isRunLengthCellMatch(
        qr,
        ditherPattern,
        skipMask,
        rowBase,
        row,
        col,
        moduleCount,
        isDarkPass,
      );
      if (match) {
        if (runStart === -1) runStart = col;
      } else if (runStart !== -1) {
        ctx.fillRect(
          (runStart + margin) * moduleSize,
          y,
          (col - runStart) * moduleSize,
          moduleSize,
        );
        runStart = -1;
      }
    }
  }
}
