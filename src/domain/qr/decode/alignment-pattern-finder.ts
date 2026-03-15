import type { BitMatrix } from './bit-matrix';
import { NotFoundException } from './exceptions';
import { ResultPoint } from './result-types';
import { AlignmentPattern } from './alignment-pattern';

/**
 * Finds alignment patterns in QR codes version 2+
 */
export class AlignmentPatternFinder {
  private readonly possibleCenters: AlignmentPattern[] = [];
  private readonly crossCheckStateCount = new Int32Array(3);

  constructor(
    private readonly image: BitMatrix,
    private readonly startX: number,
    private readonly startY: number,
    private readonly width: number,
    private readonly height: number,
    private readonly moduleSize: number,
    private readonly resultPointCallback?: (point: ResultPoint) => void
  ) {}

  find(): AlignmentPattern {
    const startX = this.startX;
    const height = this.height;
    const maxJ = startX + this.width;
    const middleI = this.startY + height / 2;
    const stateCount = new Int32Array(3);

    for (let iGen = 0; iGen < height; iGen++) {
      const i = middleI + ((iGen & 0x01) === 0 ? (iGen + 1) / 2 : -((iGen + 1) / 2));
      const result = this.processAlignmentRow(Math.floor(i), startX, maxJ, stateCount);
      if (result !== null) return result;
    }

    if (this.possibleCenters.length !== 0) {
      return this.possibleCenters[0];
    }
    throw new NotFoundException();
  }

  private checkAlignmentPatternCross(
    stateCount: Int32Array,
    i: number,
    j: number
  ): AlignmentPattern | null {
    if (!this.foundPatternCross(stateCount)) return null;
    return this.handlePossibleCenter(stateCount, i, j);
  }

  private handleAlignmentDarkAtState2(
    stateCount: Int32Array,
    i: number,
    j: number
  ): { currentState: number; result: AlignmentPattern | null } {
    const confirmed = this.checkAlignmentPatternCross(stateCount, i, j);
    if (confirmed !== null) return { currentState: 1, result: confirmed };
    stateCount[0] = stateCount[2];
    stateCount[1] = 1;
    stateCount[2] = 0;
    return { currentState: 1, result: null };
  }

  private processAlignmentPixel(
    isDark: boolean,
    currentState: number,
    stateCount: Int32Array,
    i: number,
    j: number
  ): { currentState: number; result: AlignmentPattern | null } {
    if (isDark) {
      if (currentState === 1) {
        stateCount[1]++;
        return { currentState, result: null };
      }
      if (currentState === 2) {
        return this.handleAlignmentDarkAtState2(stateCount, i, j);
      }
      stateCount[++currentState]++;
      return { currentState, result: null };
    }
    if (currentState === 1) currentState++;
    stateCount[currentState]++;
    return { currentState, result: null };
  }

  private processAlignmentRow(
    i: number,
    startX: number,
    maxJ: number,
    stateCount: Int32Array
  ): AlignmentPattern | null {
    stateCount[0] = 0;
    stateCount[1] = 0;
    stateCount[2] = 0;
    let j = startX;
    while (j < maxJ && !this.image.get(j, i)) j++;
    let currentState = 0;
    while (j < maxJ) {
      const r = this.processAlignmentPixel(this.image.get(j, i), currentState, stateCount, i, j);
      if (r.result !== null) return r.result;
      currentState = r.currentState;
      j++;
    }
    return this.checkAlignmentPatternCross(stateCount, i, maxJ);
  }

  private foundPatternCross(stateCount: Int32Array): boolean {
    const moduleSize = this.moduleSize;
    const maxVariance = moduleSize / 2;
    for (let i = 0; i < 3; i++) {
      if (Math.abs(moduleSize - stateCount[i]) >= maxVariance) return false;
    }
    return true;
  }

  private crossCheckVertical(
    startI: number,
    centerJ: number,
    maxCount: number,
    originalStateCountTotal: number
  ): number {
    const image = this.image;
    const maxI = image.getHeight();
    const stateCount = this.crossCheckStateCount;
    stateCount[0] = 0;
    stateCount[1] = 0;
    stateCount[2] = 0;

    let i = startI;
    while (i >= 0 && image.get(centerJ, i) && stateCount[1] <= maxCount) {
      stateCount[1]++;
      i--;
    }
    if (i < 0 || stateCount[1] > maxCount) return Number.NaN;
    while (i >= 0 && !image.get(centerJ, i) && stateCount[0] <= maxCount) {
      stateCount[0]++;
      i--;
    }
    if (stateCount[0] > maxCount) return Number.NaN;

    i = startI + 1;
    while (i < maxI && image.get(centerJ, i) && stateCount[1] <= maxCount) {
      stateCount[1]++;
      i++;
    }
    if (i === maxI || stateCount[1] > maxCount) return Number.NaN;
    while (i < maxI && !image.get(centerJ, i) && stateCount[2] <= maxCount) {
      stateCount[2]++;
      i++;
    }
    if (stateCount[2] > maxCount) return Number.NaN;

    const stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2];
    if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= 2 * originalStateCountTotal)
      return Number.NaN;
    return this.foundPatternCross(stateCount) ? i - stateCount[2] - stateCount[1] / 2 : Number.NaN;
  }

  private handlePossibleCenter(
    stateCount: Int32Array,
    i: number,
    j: number
  ): AlignmentPattern | null {
    const stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2];
    const centerJ = j - stateCount[2] - stateCount[1] / 2;
    const centerI = this.crossCheckVertical(
      i,
      Math.floor(centerJ),
      2 * stateCount[1],
      stateCountTotal
    );
    if (!Number.isNaN(centerI)) {
      const estimatedModuleSize = (stateCount[0] + stateCount[1] + stateCount[2]) / 3;
      for (const center of this.possibleCenters) {
        if (center.aboutEquals(estimatedModuleSize, centerI, centerJ)) {
          return center.combineEstimate(centerI, centerJ, estimatedModuleSize);
        }
      }
      const point = new AlignmentPattern(centerJ, centerI, estimatedModuleSize);
      this.possibleCenters.push(point);
      if (this.resultPointCallback) {
        this.resultPointCallback(point);
      }
    }
    return null;
  }
}
