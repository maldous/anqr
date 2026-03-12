import { isStructuralModule } from '../../../modules/qr-spec/index';
import { categorizeSkippedModule } from './categorize-skipped-module';
import type { CodewordBuildState } from './codeword-build-state';

export function processCodewordModule(
  matrix: boolean[][],
  row: number,
  currentCol: number,
  moduleCount: number,
  version: number,
  state: CodewordBuildState,
  codewords: number[],
  skipCounts: {
    finder: number;
    separator: number;
    timing: number;
    format: number;
    version: number;
    alignment: number;
    darkModule: number;
    other: number;
  }
): void {
  state.visitedModules++;

  if (isStructuralModule(row, currentCol, moduleCount, version)) {
    state.skippedAsFunction++;
    categorizeSkippedModule(row, currentCol, moduleCount, version, skipCounts);
    return;
  }

  state.currentByte = (state.currentByte << 1) | (matrix[row]?.[currentCol] ? 1 : 0);
  state.bitsRead++;

  if (state.bitsRead === 8) {
    codewords.push(state.currentByte);
    state.currentByte = 0;
    state.bitsRead = 0;
  }
}
