import type { ECCLevel } from './bit-mapping';
import { log } from './log';
import { createQREncoderForGenerate } from './create-qr-encoder-for-generate';

export function logMatrixMismatchDiagnostic(
  matrix: boolean[][],
  data: string,
  originalDataLength: number,
  suffixMode: 'byte' | 'numeric',
  ecc: ECCLevel,
  actualVersion: number,
  actualMask: number,
  moduleCount: number
): void {
  const debugQr = createQREncoderForGenerate(
    data,
    originalDataLength,
    suffixMode,
    ecc,
    actualVersion,
    actualMask
  );

  let mismatchCount = 0;
  const maxMismatches = 10;
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      const regenValue = matrix[r][c];
      const encoderValue = debugQr.isDark(r, c);
      if (regenValue !== encoderValue) {
        if (mismatchCount < maxMismatches) {
          log.warn('Matrix mismatch detected', {
            row: r,
            col: c,
            regenerated: regenValue,
            encoder: encoderValue,
          });
        }
        mismatchCount++;
      }
    }
  }

  if (mismatchCount > 0) {
    log.warn('Total matrix mismatches', {
      mismatchCount,
      moduleCount,
      totalModules: moduleCount * moduleCount,
      mismatchPercent: `${((mismatchCount / (moduleCount * moduleCount)) * 100).toFixed(2)}%`,
    });
  } else {
    log.info('Matrix validation passed - regenerated matrix matches encoder exactly');
  }
}
