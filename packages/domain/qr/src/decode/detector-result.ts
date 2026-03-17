import type { BitMatrix } from "./bit-matrix";
import { ResultPoint } from "./result-types";

/**
 * Detector result containing bit matrix and detected points
 */
export class DetectorResult {
  constructor(
    private readonly bits: BitMatrix,
    private readonly points: ResultPoint[],
  ) {}

  getBits(): BitMatrix {
    return this.bits;
  }

  getPoints(): ResultPoint[] {
    return this.points;
  }
}
