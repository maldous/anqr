import { getVersionFromModuleCount } from '../../../modules/qr-spec/index';
import { CodewordBuildState } from './codeword-build-state';
import { processCodewordModule } from './process-codeword-module';
import { qrDecoderLog } from './qr-decoder-log';

/**
 * Read codewords from the matrix in the QR-specified zigzag order
 */
export function readCodewords(matrix: boolean[][], moduleCount: number): number[] {
  const codewords: number[] = [];

  // Diagnostics: verify function-module skipping is correct.
  // If this is wrong, the bitstream shifts and RS will never succeed.
  const version = getVersionFromModuleCount(moduleCount);
  const skipCounts = {
    finder: 0,
    separator: 0,
    timing: 0,
    format: 0,
    version: 0,
    alignment: 0,
    darkModule: 0,
    other: 0,
  };
  const state: CodewordBuildState = {
    currentByte: 0,
    bitsRead: 0,
    visitedModules: 0,
    skippedAsFunction: 0,
  };

  qrDecoderLog.trace('codewords: Starting codeword extraction', {
    moduleCount,
    matrixRows: matrix.length,
  });

  // Start from bottom-right, move up in two-column pairs
  let up = true;
  let col = moduleCount - 1;
  while (col >= 1) {
    // Skip the timing pattern column
    if (col === 6) col = 5;

    for (
      let row = up ? moduleCount - 1 : 0;
      up ? row >= 0 : row < moduleCount;
      row += up ? -1 : 1
    ) {
      for (let c = 0; c < 2; c++) {
        processCodewordModule(
          matrix,
          row,
          col - c,
          moduleCount,
          version,
          state,
          codewords,
          skipCounts
        );
      }
    }
    up = !up;
    col -= 2;
  }

  qrDecoderLog.trace('codewords: Extracted codewords', {
    count: codewords.length,
    first10: codewords
      .slice(0, 10)
      .map((c) => c.toString(16).padStart(2, '0'))
      .join(' '),
    traversal: {
      visitedModules: state.visitedModules,
      skippedAsFunction: state.skippedAsFunction,
      skipCounts,
    },
  });

  return codewords;
}
