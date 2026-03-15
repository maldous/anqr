import { createLogger } from '../../../infra/logging/logger';
import { checkTimingPosition } from './check-timing-position';

const qrDecoderLog = createLogger('DECODER');

export function collectTimingDiagnostics(rawMatrix: boolean[][], moduleCount: number): void {
  const timingMismatches: Array<{ r: number; c: number; exp: 0 | 1; got: 0 | 1 }> = [];
  for (let c = 8; c < moduleCount - 8; c++) {
    checkTimingPosition(rawMatrix, 6, c, c, timingMismatches);
  }
  for (let r = 8; r < moduleCount - 8; r++) {
    checkTimingPosition(rawMatrix, r, 6, r, timingMismatches);
  }
  qrDecoderLog.trace('diag: Timing pattern mismatches (first 12)', {
    count: timingMismatches.length,
    mismatches: timingMismatches.map((m) => `(${m.r},${m.c}) exp=${m.exp} got=${m.got}`),
  });
}
