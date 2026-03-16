import type { BitMatrix } from './bit-matrix';
import { NotFoundException } from './exceptions';
import {
  type AlignmentPattern,
  AlignmentPatternFinder,
  FinderPatternFinder,
  type FinderPatternInfo,
} from './pattern-finder';
import { DefaultGridSampler, MathUtils, PerspectiveTransform } from './perspective';
import { Version } from './qr-version';
import { ResultPoint } from './result-types';
import { DetectorResult } from './detector-result';

/**
 * Detects a QR code in an image
 */
export class Detector {
  private resultPointCallback?: (point: ResultPoint) => void;

  constructor(private readonly image: BitMatrix) {}

  detect(hints?: Map<number, unknown>): DetectorResult {
    this.resultPointCallback = hints?.get(9) as ((point: ResultPoint) => void) | undefined; // DecodeHintType.NEED_RESULT_POINT_CALLBACK

    const finder = new FinderPatternFinder(this.image, this.resultPointCallback);
    const info = finder.find(hints);

    return this.processFinderPatternInfo(info);
  }

  protected processFinderPatternInfo(info: FinderPatternInfo): DetectorResult {
    const topLeft = info.getTopLeft();
    const topRight = info.getTopRight();
    const bottomLeft = info.getBottomLeft();

    const moduleSize = this.calculateModuleSize(topLeft, topRight, bottomLeft);
    if (moduleSize < 1) {
      throw new NotFoundException();
    }
    const dimension = Detector.computeDimension(topLeft, topRight, bottomLeft, moduleSize);
    const provisionalVersion = Version.getProvisionalVersionForDimension(dimension);
    const modulesBetweenFPCenters = provisionalVersion.getDimensionForVersion() - 7;

    let alignmentPattern: AlignmentPattern | null = null;
    if (provisionalVersion.getAlignmentPatternCenters().length > 0) {
      const bottomRightX = topRight.getX() - topLeft.getX() + bottomLeft.getX();
      const bottomRightY = topRight.getY() - topLeft.getY() + bottomLeft.getY();
      const correctionToTopLeft = 1 - 3 / modulesBetweenFPCenters;
      const estAlignmentX = Math.floor(
        topLeft.getX() + correctionToTopLeft * (bottomRightX - topLeft.getX())
      );
      const estAlignmentY = Math.floor(
        topLeft.getY() + correctionToTopLeft * (bottomRightY - topLeft.getY())
      );

      for (let i = 4; i <= 16; i <<= 1) {
        try {
          alignmentPattern = this.findAlignmentInRegion(
            moduleSize,
            estAlignmentX,
            estAlignmentY,
            i
          );
          break;
        } catch {
          // try next
        }
      }
    }

    const transform = Detector.createTransform(
      topLeft,
      topRight,
      bottomLeft,
      alignmentPattern,
      dimension
    );
    const bits = Detector.sampleGrid(this.image, transform, dimension);

    let points: ResultPoint[];
    if (alignmentPattern === null) {
      points = [bottomLeft, topLeft, topRight];
    } else {
      points = [bottomLeft, topLeft, topRight, alignmentPattern];
    }
    return new DetectorResult(bits, points);
  }

  private static createTransform(
    topLeft: ResultPoint,
    topRight: ResultPoint,
    bottomLeft: ResultPoint,
    alignmentPattern: AlignmentPattern | null,
    dimension: number
  ): PerspectiveTransform {
    const dimMinusThree = dimension - 3.5;
    let bottomRightX: number;
    let bottomRightY: number;
    let sourceBottomRightX: number;
    let sourceBottomRightY: number;
    if (alignmentPattern === null) {
      bottomRightX = topRight.getX() - topLeft.getX() + bottomLeft.getX();
      bottomRightY = topRight.getY() - topLeft.getY() + bottomLeft.getY();
      sourceBottomRightX = dimMinusThree;
      sourceBottomRightY = dimMinusThree;
    } else {
      bottomRightX = alignmentPattern.getX();
      bottomRightY = alignmentPattern.getY();
      sourceBottomRightX = dimMinusThree - 3;
      sourceBottomRightY = sourceBottomRightX;
    }

    return PerspectiveTransform.quadrilateralToQuadrilateral(
      3.5,
      3.5,
      dimMinusThree,
      3.5,
      sourceBottomRightX,
      sourceBottomRightY,
      3.5,
      dimMinusThree,
      topLeft.getX(),
      topLeft.getY(),
      topRight.getX(),
      topRight.getY(),
      bottomRightX,
      bottomRightY,
      bottomLeft.getX(),
      bottomLeft.getY()
    );
  }

  private static sampleGrid(
    image: BitMatrix,
    transform: PerspectiveTransform,
    dimension: number
  ): BitMatrix {
    const sampler = new DefaultGridSampler();
    return sampler.sampleGridWithTransform(image, dimension, dimension, transform);
  }

  private static computeDimension(
    topLeft: ResultPoint,
    topRight: ResultPoint,
    bottomLeft: ResultPoint,
    moduleSize: number
  ): number {
    const tltrCentersDimension = MathUtils.round(
      ResultPoint.distance(topLeft, topRight) / moduleSize
    );
    const tlblCentersDimension = MathUtils.round(
      ResultPoint.distance(topLeft, bottomLeft) / moduleSize
    );
    let dimension = Math.floor((tltrCentersDimension + tlblCentersDimension) / 2) + 7;
    switch (dimension & 0x03) {
      case 0:
        dimension++;
        break;
      case 2:
        dimension--;
        break;
      case 3:
        throw new NotFoundException();
    }
    return dimension;
  }

  protected calculateModuleSize(
    topLeft: ResultPoint,
    topRight: ResultPoint,
    bottomLeft: ResultPoint
  ): number {
    return (
      (this.calculateModuleSizeOneWay(topLeft, topRight) +
        this.calculateModuleSizeOneWay(topLeft, bottomLeft)) /
      2
    );
  }

  private calculateModuleSizeOneWay(pattern: ResultPoint, otherPattern: ResultPoint): number {
    const moduleSizeEst1 = this.sizeOfBlackWhiteBlackRunBothWays(
      Math.floor(pattern.getX()),
      Math.floor(pattern.getY()),
      Math.floor(otherPattern.getX()),
      Math.floor(otherPattern.getY())
    );
    const moduleSizeEst2 = this.sizeOfBlackWhiteBlackRunBothWays(
      Math.floor(otherPattern.getX()),
      Math.floor(otherPattern.getY()),
      Math.floor(pattern.getX()),
      Math.floor(pattern.getY())
    );
    if (Number.isNaN(moduleSizeEst1)) return moduleSizeEst2 / 7;
    if (Number.isNaN(moduleSizeEst2)) return moduleSizeEst1 / 7;
    return (moduleSizeEst1 + moduleSizeEst2) / 14;
  }

  private static clampEndpoint(
    from: number,
    to: number,
    size: number
  ): { clamped: number; scale: number } {
    if (to < 0) {
      return { clamped: 0, scale: from / (from - to) };
    }
    if (to >= size) {
      return { clamped: size - 1, scale: (size - 1 - from) / (to - from) };
    }
    return { clamped: to, scale: 1 };
  }

  private sizeOfBlackWhiteBlackRunBothWays(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ): number {
    let result = this.sizeOfBlackWhiteBlackRun(fromX, fromY, toX, toY);

    let otherToX = fromX - (toX - fromX);
    const xClamp = Detector.clampEndpoint(fromX, otherToX, this.image.getWidth());
    otherToX = xClamp.clamped;
    let otherToY = Math.floor(fromY - (toY - fromY) * xClamp.scale);

    const yClamp = Detector.clampEndpoint(fromY, otherToY, this.image.getHeight());
    otherToY = yClamp.clamped;
    otherToX = Math.floor(fromX + (otherToX - fromX) * yClamp.scale);

    result += this.sizeOfBlackWhiteBlackRun(fromX, fromY, otherToX, otherToY);
    return result - 1;
  }

  private static advanceBWBState(
    image: BitMatrix,
    realX: number,
    realY: number,
    state: number
  ): number {
    if (state === 1) {
      if (image.get(realX, realY)) return state + 1;
      return state;
    }
    if (!image.get(realX, realY)) return state + 1;
    return state;
  }

  private static swapIfSteep(
    steep: boolean,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ): { fromX: number; fromY: number; toX: number; toY: number } {
    if (!steep) return { fromX, fromY, toX, toY };
    return { fromX: fromY, fromY: fromX, toX: toY, toY: toX };
  }

  private sizeOfBlackWhiteBlackRun(fromX: number, fromY: number, toX: number, toY: number): number {
    const steep = Math.abs(toY - fromY) > Math.abs(toX - fromX);
    const s = Detector.swapIfSteep(steep, fromX, fromY, toX, toY);
    fromX = s.fromX;
    fromY = s.fromY;
    toX = s.toX;
    toY = s.toY;

    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);
    let error = -dx / 2;
    const xstep = fromX < toX ? 1 : -1;
    const ystep = fromY < toY ? 1 : -1;

    let state = 0;
    const xLimit = toX + xstep;
    for (let x = fromX, y = fromY; xstep > 0 ? x < xLimit : x > xLimit; x += xstep) {
      const [realX, realY] = steep ? [y, x] : [x, y];

      state = Detector.advanceBWBState(this.image, realX, realY, state);

      if (state === 3) {
        return Math.hypot(x - fromX, y - fromY);
      }
      error += dy;
      if (error > 0 && y === toY) break;
      if (error > 0) {
        y += ystep;
        error -= dx;
      }
    }

    if (state === 2) {
      return Math.hypot(toX + xstep - fromX, toY - fromY);
    }
    return Number.NaN;
  }

  protected findAlignmentInRegion(
    overallEstModuleSize: number,
    estAlignmentX: number,
    estAlignmentY: number,
    allowanceFactor: number
  ): AlignmentPattern {
    const allowance = Math.floor(allowanceFactor * overallEstModuleSize);
    const alignmentAreaLeftX = Math.max(0, estAlignmentX - allowance);
    const alignmentAreaRightX = Math.min(this.image.getWidth() - 1, estAlignmentX + allowance);
    if (alignmentAreaRightX - alignmentAreaLeftX < overallEstModuleSize * 3) {
      throw new NotFoundException();
    }

    const alignmentAreaTopY = Math.max(0, estAlignmentY - allowance);
    const alignmentAreaBottomY = Math.min(this.image.getHeight() - 1, estAlignmentY + allowance);
    if (alignmentAreaBottomY - alignmentAreaTopY < overallEstModuleSize * 3) {
      throw new NotFoundException();
    }

    const alignmentFinder = new AlignmentPatternFinder(
      this.image,
      alignmentAreaLeftX,
      alignmentAreaTopY,
      alignmentAreaRightX - alignmentAreaLeftX,
      alignmentAreaBottomY - alignmentAreaTopY,
      overallEstModuleSize,
      this.resultPointCallback
    );
    return alignmentFinder.find();
  }
}
