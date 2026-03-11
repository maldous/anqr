/**
 * QR Decoder Pattern Finder
 * Finder pattern and alignment pattern detection
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('DECODER');

import type { BitMatrix } from './bit-matrix';
import { NotFoundException } from './exceptions';
import { ResultPoint } from './result-types';

function patternAboutEquals(
  patternX: number,
  patternY: number,
  patternModuleSize: number,
  moduleSize: number,
  i: number,
  j: number
): boolean {
  if (Math.abs(i - patternY) <= moduleSize && Math.abs(j - patternX) <= moduleSize) {
    const moduleSizeDiff = Math.abs(moduleSize - patternModuleSize);
    return moduleSizeDiff <= 1 || moduleSizeDiff <= patternModuleSize;
  }
  return false;
}

/**
 * Finder pattern (one of three corner squares)
 */
export class FinderPattern extends ResultPoint {
  constructor(
    posX: number,
    posY: number,
    private readonly estimatedModuleSize: number,
    private count: number = 1
  ) {
    super(posX, posY);
  }

  getEstimatedModuleSize(): number {
    return this.estimatedModuleSize;
  }

  getCount(): number {
    return this.count;
  }

  incrementCount(): void {
    this.count++;
  }

  aboutEquals(moduleSize: number, i: number, j: number): boolean {
    return patternAboutEquals(this.getX(), this.getY(), this.estimatedModuleSize, moduleSize, i, j);
  }

  combineEstimate(i: number, j: number, newModuleSize: number): FinderPattern {
    const combinedCount = this.count + 1;
    const combinedX = (this.count * this.getX() + j) / combinedCount;
    const combinedY = (this.count * this.getY() + i) / combinedCount;
    const combinedModuleSize =
      (this.count * this.estimatedModuleSize + newModuleSize) / combinedCount;
    return new FinderPattern(combinedX, combinedY, combinedModuleSize, combinedCount);
  }
}

/**
 * Finder pattern info (three finder patterns with metadata)
 */
export class FinderPatternInfo {
  constructor(
    private readonly bottomLeft: FinderPattern,
    private readonly topLeft: FinderPattern,
    private readonly topRight: FinderPattern
  ) {}

  getBottomLeft(): FinderPattern {
    return this.bottomLeft;
  }

  getTopLeft(): FinderPattern {
    return this.topLeft;
  }

  getTopRight(): FinderPattern {
    return this.topRight;
  }
}

/**
 * Alignment pattern (smaller squares in larger QR codes)
 */
export class AlignmentPattern extends ResultPoint {
  constructor(
    posX: number,
    posY: number,
    private readonly estimatedModuleSize: number
  ) {
    super(posX, posY);
  }

  aboutEquals(moduleSize: number, i: number, j: number): boolean {
    return patternAboutEquals(this.getX(), this.getY(), this.estimatedModuleSize, moduleSize, i, j);
  }

  combineEstimate(i: number, j: number, newModuleSize: number): AlignmentPattern {
    const combinedX = (this.getX() + j) / 2;
    const combinedY = (this.getY() + i) / 2;
    const combinedModuleSize = (this.estimatedModuleSize + newModuleSize) / 2;
    return new AlignmentPattern(combinedX, combinedY, combinedModuleSize);
  }
}

/**
 * Finds the three finder patterns in a QR code image
 */
export class FinderPatternFinder {
  private static readonly CENTER_QUORUM = 2;
  private static readonly MIN_SKIP = 3;
  private static readonly MAX_MODULES = 97;

  private possibleCenters: FinderPattern[] = [];
  private hasSkipped = false;
  private readonly crossCheckStateCount = new Int32Array(5);

  constructor(
    private readonly image: BitMatrix,
    private readonly resultPointCallback?: (point: ResultPoint) => void
  ) {}

  find(hints?: Map<number, any>): FinderPatternInfo {
    const tryHarder = hints?.get(3) === true; // DecodeHintType.TRY_HARDER
    const image = this.image;
    const maxI = image.getHeight();
    const maxJ = image.getWidth();

    let iSkip = Math.floor((3 * maxI) / (4 * FinderPatternFinder.MAX_MODULES));
    if (iSkip < FinderPatternFinder.MIN_SKIP || tryHarder) {
      iSkip = FinderPatternFinder.MIN_SKIP;
    }

    let done = false;
    const stateCount = new Int32Array(5);
    let i = iSkip - 1;
    while (i < maxI && !done) {
      const rowResult = this.processFinderRow(image, i, maxJ, stateCount, iSkip);
      iSkip = rowResult.iSkip;
      done = rowResult.done;
      if (rowResult.rowJump > 0) {
        i += rowResult.rowJump;
      }
      i += iSkip;
    }

    const patternInfo = this.selectBestPatterns();
    ResultPoint.orderBestPatterns(patternInfo);
    return new FinderPatternInfo(patternInfo[0], patternInfo[1], patternInfo[2]);
  }

  private processConfirmedCenter(
    stateCount: Int32Array,
    _iSkip: number
  ): { iSkip: number; done: boolean; rowJump: number; jumpToEnd: boolean } {
    const iSkip = 2;
    if (this.hasSkipped) {
      return { iSkip, done: this.haveMultiplyConfirmedCenters(), rowJump: 0, jumpToEnd: false };
    }
    const rowSkipVal = this.findRowSkip();
    if (rowSkipVal > stateCount[2]) {
      return { iSkip, done: false, rowJump: rowSkipVal - stateCount[2] - iSkip, jumpToEnd: true };
    }
    return { iSkip, done: false, rowJump: 0, jumpToEnd: false };
  }

  private processLightPixelAtState4(
    stateCount: Int32Array,
    i: number,
    j: number,
    iSkip: number
  ): {
    currentState: number;
    iSkip: number;
    done: boolean;
    rowJump: number;
    skipIncrement: boolean;
    jumpToEnd: boolean;
  } {
    if (!FinderPatternFinder.foundPatternCross(stateCount)) {
      FinderPatternFinder.doShiftCounts2(stateCount);
      return {
        currentState: 3,
        iSkip,
        done: false,
        rowJump: 0,
        skipIncrement: false,
        jumpToEnd: false,
      };
    }
    const confirmed = this.handlePossibleCenter(stateCount, i, j);
    if (!confirmed) {
      FinderPatternFinder.doShiftCounts2(stateCount);
      return {
        currentState: 3,
        iSkip,
        done: false,
        rowJump: 0,
        skipIncrement: true,
        jumpToEnd: false,
      };
    }
    const result = this.processConfirmedCenter(stateCount, iSkip);
    return {
      currentState: 0,
      iSkip: result.iSkip,
      done: result.done,
      rowJump: result.rowJump,
      skipIncrement: false,
      jumpToEnd: result.jumpToEnd,
    };
  }

  private static advanceFinderDarkPixel(currentState: number, stateCount: Int32Array): number {
    if ((currentState & 1) === 1) currentState++;
    stateCount[currentState]++;
    return currentState;
  }

  private static advanceFinderLightPixel(
    currentState: number,
    stateCount: Int32Array
  ): number | -1 {
    if ((currentState & 1) !== 0) {
      stateCount[currentState]++;
      return currentState;
    }
    if (currentState === 4) return -1;
    stateCount[++currentState]++;
    return currentState;
  }

  private checkEndOfRowFinderPattern(
    stateCount: Int32Array,
    i: number,
    maxJ: number,
    iSkip: number,
    done: boolean
  ): { iSkip: number; done: boolean } {
    if (FinderPatternFinder.foundPatternCross(stateCount)) {
      const confirmed = this.handlePossibleCenter(stateCount, i, maxJ);
      if (confirmed) {
        iSkip = stateCount[0];
        if (this.hasSkipped) {
          done = this.haveMultiplyConfirmedCenters();
        }
      }
    }
    return { iSkip, done };
  }

  private applyState4Result(
    r: {
      currentState: number;
      iSkip: number;
      done: boolean;
      rowJump: number;
      skipIncrement: boolean;
      jumpToEnd: boolean;
    },
    stateCount: Int32Array,
    j: number,
    maxJ: number
  ): {
    currentState: number;
    iSkip: number;
    done: boolean;
    rowJump: number;
    newJ: number;
    shouldContinue: boolean;
  } {
    if (r.skipIncrement) {
      return {
        currentState: r.currentState,
        iSkip: r.iSkip,
        done: r.done,
        rowJump: r.rowJump,
        newJ: j + 1,
        shouldContinue: true,
      };
    }
    let newJ = j;
    if (r.jumpToEnd) {
      newJ = maxJ - 1;
    }
    if (r.currentState === 0) FinderPatternFinder.doClearCounts(stateCount);
    return {
      currentState: r.currentState,
      iSkip: r.iSkip,
      done: r.done,
      rowJump: r.rowJump,
      newJ,
      shouldContinue: false,
    };
  }

  private processFinderRow(
    image: BitMatrix,
    i: number,
    maxJ: number,
    stateCount: Int32Array,
    iSkip: number
  ): { iSkip: number; done: boolean; rowJump: number } {
    FinderPatternFinder.doClearCounts(stateCount);
    let currentState = 0;
    let done = false;
    let rowJump = 0;
    let j = 0;
    while (j < maxJ) {
      if (image.get(j, i)) {
        currentState = FinderPatternFinder.advanceFinderDarkPixel(currentState, stateCount);
      } else {
        const next = FinderPatternFinder.advanceFinderLightPixel(currentState, stateCount);
        if (next >= 0) {
          currentState = next;
        } else {
          const h = this.applyState4Result(
            this.processLightPixelAtState4(stateCount, i, j, iSkip),
            stateCount,
            j,
            maxJ
          );
          currentState = h.currentState;
          iSkip = h.iSkip;
          done = h.done;
          rowJump = h.rowJump;
          j = h.newJ;
          if (h.shouldContinue) continue;
        }
      }
      j++;
    }
    const endResult = this.checkEndOfRowFinderPattern(stateCount, i, maxJ, iSkip, done);
    return { iSkip: endResult.iSkip, done: endResult.done, rowJump };
  }

  private static doClearCounts(counts: Int32Array): void {
    counts.fill(0);
  }

  private static doShiftCounts2(stateCount: Int32Array): void {
    stateCount[0] = stateCount[2];
    stateCount[1] = stateCount[3];
    stateCount[2] = stateCount[4];
    stateCount[3] = 1;
    stateCount[4] = 0;
  }

  private static foundPatternCross(stateCount: Int32Array): boolean {
    let totalModuleSize = 0;
    for (let i = 0; i < 5; i++) {
      const count = stateCount[i];
      if (count === 0) return false;
      totalModuleSize += count;
    }
    if (totalModuleSize < 7) return false;
    const moduleSize = totalModuleSize / 7;
    const maxVariance = moduleSize / 2;
    return (
      Math.abs(moduleSize - stateCount[0]) < maxVariance &&
      Math.abs(moduleSize - stateCount[1]) < maxVariance &&
      Math.abs(3 * moduleSize - stateCount[2]) < 3 * maxVariance &&
      Math.abs(moduleSize - stateCount[3]) < maxVariance &&
      Math.abs(moduleSize - stateCount[4]) < maxVariance
    );
  }

  private getCrossCheckStateCount(): Int32Array {
    this.crossCheckStateCount.fill(0);
    return this.crossCheckStateCount;
  }

  private scanCrossCheckUp(
    centerJ: number,
    startI: number,
    maxCount: number,
    stateCount: Int32Array
  ): boolean {
    const image = this.image;
    let i = startI;
    while (i >= 0 && image.get(centerJ, i)) {
      stateCount[2]++;
      i--;
    }
    if (i < 0) return false;
    while (i >= 0 && !image.get(centerJ, i) && stateCount[1] <= maxCount) {
      stateCount[1]++;
      i--;
    }
    if (i < 0 || stateCount[1] > maxCount) return false;
    while (i >= 0 && image.get(centerJ, i) && stateCount[0] <= maxCount) {
      stateCount[0]++;
      i--;
    }
    return stateCount[0] <= maxCount;
  }

  private scanCrossCheckDown(
    centerJ: number,
    startI: number,
    maxCount: number,
    stateCount: Int32Array
  ): number {
    const image = this.image;
    const maxI = image.getHeight();
    let i = startI;
    while (i < maxI && image.get(centerJ, i)) {
      stateCount[2]++;
      i++;
    }
    if (i === maxI) return -1;
    while (i < maxI && !image.get(centerJ, i) && stateCount[3] < maxCount) {
      stateCount[3]++;
      i++;
    }
    if (i === maxI || stateCount[3] >= maxCount) return -1;
    while (i < maxI && image.get(centerJ, i) && stateCount[4] < maxCount) {
      stateCount[4]++;
      i++;
    }
    if (stateCount[4] >= maxCount) return -1;
    return i;
  }

  private crossCheckVertical(
    startI: number,
    centerJ: number,
    maxCount: number,
    originalStateCountTotal: number
  ): number {
    const stateCount = this.getCrossCheckStateCount();

    if (!this.scanCrossCheckUp(centerJ, startI, maxCount, stateCount)) return Number.NaN;
    const endI = this.scanCrossCheckDown(centerJ, startI + 1, maxCount, stateCount);
    if (endI < 0) return Number.NaN;

    const stateCountTotal =
      stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
    if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= 2 * originalStateCountTotal)
      return Number.NaN;
    return FinderPatternFinder.foundPatternCross(stateCount)
      ? FinderPatternFinder.centerFromEnd(stateCount, endI)
      : Number.NaN;
  }

  private scanCrossCheckLeft(
    centerI: number,
    startJ: number,
    maxCount: number,
    stateCount: Int32Array
  ): boolean {
    const image = this.image;
    let j = startJ;
    while (j >= 0 && image.get(j, centerI)) {
      stateCount[2]++;
      j--;
    }
    if (j < 0) return false;
    while (j >= 0 && !image.get(j, centerI) && stateCount[1] <= maxCount) {
      stateCount[1]++;
      j--;
    }
    if (j < 0 || stateCount[1] > maxCount) return false;
    while (j >= 0 && image.get(j, centerI) && stateCount[0] <= maxCount) {
      stateCount[0]++;
      j--;
    }
    return stateCount[0] <= maxCount;
  }

  private scanCrossCheckRight(
    centerI: number,
    startJ: number,
    maxCount: number,
    stateCount: Int32Array
  ): number {
    const image = this.image;
    const maxJ = image.getWidth();
    let j = startJ;
    while (j < maxJ && image.get(j, centerI)) {
      stateCount[2]++;
      j++;
    }
    if (j === maxJ) return -1;
    while (j < maxJ && !image.get(j, centerI) && stateCount[3] < maxCount) {
      stateCount[3]++;
      j++;
    }
    if (j === maxJ || stateCount[3] >= maxCount) return -1;
    while (j < maxJ && image.get(j, centerI) && stateCount[4] < maxCount) {
      stateCount[4]++;
      j++;
    }
    if (stateCount[4] >= maxCount) return -1;
    return j;
  }

  private crossCheckHorizontal(
    startJ: number,
    centerI: number,
    maxCount: number,
    originalStateCountTotal: number
  ): number {
    const stateCount = this.getCrossCheckStateCount();

    if (!this.scanCrossCheckLeft(centerI, startJ, maxCount, stateCount)) return Number.NaN;
    const endJ = this.scanCrossCheckRight(centerI, startJ + 1, maxCount, stateCount);
    if (endJ < 0) return Number.NaN;

    const stateCountTotal =
      stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
    if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= originalStateCountTotal)
      return Number.NaN;
    return FinderPatternFinder.foundPatternCross(stateCount)
      ? FinderPatternFinder.centerFromEnd(stateCount, endJ)
      : Number.NaN;
  }

  private handlePossibleCenter(stateCount: Int32Array, i: number, j: number): boolean {
    const stateCountTotal =
      stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
    let centerJ = FinderPatternFinder.centerFromEnd(stateCount, j);
    const centerI = this.crossCheckVertical(i, Math.floor(centerJ), stateCount[2], stateCountTotal);
    if (!Number.isNaN(centerI)) {
      centerJ = this.crossCheckHorizontal(
        Math.floor(centerJ),
        Math.floor(centerI),
        stateCount[2],
        stateCountTotal
      );
      if (!Number.isNaN(centerJ)) {
        this.confirmCenter(centerI, centerJ, stateCountTotal / 7);
        return true;
      }
    }
    return false;
  }

  private confirmCenter(centerI: number, centerJ: number, estimatedModuleSize: number): void {
    for (let index = 0; index < this.possibleCenters.length; index++) {
      const center = this.possibleCenters[index];
      if (center.aboutEquals(estimatedModuleSize, centerI, centerJ)) {
        this.possibleCenters[index] = center.combineEstimate(centerI, centerJ, estimatedModuleSize);
        return;
      }
    }
    const point = new FinderPattern(centerJ, centerI, estimatedModuleSize);
    this.possibleCenters.push(point);
    if (this.resultPointCallback) {
      this.resultPointCallback(point);
    }
  }

  private static centerFromEnd(stateCount: Int32Array, end: number): number {
    return end - stateCount[4] - stateCount[3] - stateCount[2] / 2;
  }

  private findRowSkip(): number {
    const max = this.possibleCenters.length;
    if (max <= 1) return 0;
    let firstConfirmedCenter: FinderPattern | null = null;
    for (const center of this.possibleCenters) {
      if (center.getCount() >= FinderPatternFinder.CENTER_QUORUM) {
        if (firstConfirmedCenter === null) {
          firstConfirmedCenter = center;
        } else {
          this.hasSkipped = true;
          return Math.floor(
            (Math.abs(firstConfirmedCenter.getX() - center.getX()) -
              Math.abs(firstConfirmedCenter.getY() - center.getY())) /
              2
          );
        }
      }
    }
    return 0;
  }

  private haveMultiplyConfirmedCenters(): boolean {
    let confirmedCount = 0;
    let totalModuleSize = 0;
    const max = this.possibleCenters.length;
    for (const pattern of this.possibleCenters) {
      if (pattern.getCount() >= FinderPatternFinder.CENTER_QUORUM) {
        confirmedCount++;
        totalModuleSize += pattern.getEstimatedModuleSize();
      }
    }
    if (confirmedCount < 3) return false;
    const average = totalModuleSize / max;
    let totalDeviation = 0;
    for (const pattern of this.possibleCenters) {
      totalDeviation += Math.abs(pattern.getEstimatedModuleSize() - average);
    }
    return totalDeviation <= 0.05 * totalModuleSize;
  }

  private selectBestPatterns(): FinderPattern[] {
    const startSize = this.possibleCenters.length;
    if (startSize < 3) throw new NotFoundException();

    this.possibleCenters.sort((a, b) => a.getEstimatedModuleSize() - b.getEstimatedModuleSize());

    let distortion = Number.MAX_VALUE;
    const bestPatterns: FinderPattern[] = new Array(3);

    for (let i = 0; i < startSize - 2; i++) {
      const fpi = this.possibleCenters[i];
      const result = this.scorePairsFrom(fpi, i, startSize);
      if (result.score >= 0 && result.score < distortion) {
        distortion = result.score;
        bestPatterns[0] = fpi;
        bestPatterns[1] = result.fpj;
        bestPatterns[2] = result.fpk;
      }
    }

    if (distortion === Number.MAX_VALUE) throw new NotFoundException();
    return bestPatterns;
  }

  private scorePairsFrom(
    fpi: FinderPattern,
    i: number,
    startSize: number
  ): { score: number; fpj: FinderPattern; fpk: FinderPattern } {
    const minModuleSize = fpi.getEstimatedModuleSize();
    let bestScore = Number.MAX_VALUE;
    let bestJ = this.possibleCenters[i + 1];
    let bestK = this.possibleCenters[i + 2];
    for (let j = i + 1; j < startSize - 1; j++) {
      const fpj = this.possibleCenters[j];
      const squares0 = FinderPatternFinder.squaredDistance(fpi, fpj);
      for (let k = j + 1; k < startSize; k++) {
        const fpk = this.possibleCenters[k];
        if (fpk.getEstimatedModuleSize() > minModuleSize * 1.4) continue;
        const score = FinderPatternFinder.evaluateTriple(fpi, fpj, fpk, squares0);
        if (score >= 0 && score < bestScore) {
          bestScore = score;
          bestJ = fpj;
          bestK = fpk;
        }
      }
    }
    return { score: bestScore, fpj: bestJ, fpk: bestK };
  }

  private static evaluateTriple(
    fpi: FinderPattern,
    fpj: FinderPattern,
    fpk: FinderPattern,
    squares0: number
  ): number {
    const a = squares0;
    const b = FinderPatternFinder.squaredDistance(fpj, fpk);
    const c = FinderPatternFinder.squaredDistance(fpi, fpk);

    let sides: number[];
    if (a >= b && a >= c) {
      sides = [a, b, c];
    } else if (b >= a && b >= c) {
      sides = [b, a, c];
    } else {
      sides = [c, a, b];
    }

    const d = Math.abs(sides[1] - sides[2]) / Math.min(sides[1], sides[2]);
    if (d >= 0.1) return -1;

    const estimatedModuleCount =
      Math.sqrt(sides[0]) / ((fpi.getEstimatedModuleSize() + fpk.getEstimatedModuleSize()) / 2);
    return Math.abs(estimatedModuleCount - 14);
  }

  private static squaredDistance(a: FinderPattern, b: FinderPattern): number {
    const x = a.getX() - b.getX();
    const y = a.getY() - b.getY();
    return x * x + y * y;
  }
}

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
