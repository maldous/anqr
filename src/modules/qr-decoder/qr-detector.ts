/**
 * QR Decoder Detector
 * Main QR code detector using finder patterns
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('DECODER');

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

/**
 * Detector result containing bit matrix and detected points
 */
export class DetectorResult {
  constructor(
    private bits: BitMatrix,
    private points: ResultPoint[]
  ) {}

  getBits(): BitMatrix {
    return this.bits;
  }

  getPoints(): ResultPoint[] {
    return this.points;
  }
}

/**
 * Detects a QR code in an image
 */
export class Detector {
  private resultPointCallback?: (point: ResultPoint) => void;

  constructor(private image: BitMatrix) {}

  detect(hints?: Map<number, any>): DetectorResult {
    this.resultPointCallback = hints?.get(9); // DecodeHintType.NEED_RESULT_POINT_CALLBACK

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
        } catch (_re) {
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
    if (alignmentPattern !== null) {
      bottomRightX = alignmentPattern.getX();
      bottomRightY = alignmentPattern.getY();
      sourceBottomRightX = dimMinusThree - 3;
      sourceBottomRightY = sourceBottomRightX;
    } else {
      bottomRightX = topRight.getX() - topLeft.getX() + bottomLeft.getX();
      bottomRightY = topRight.getY() - topLeft.getY() + bottomLeft.getY();
      sourceBottomRightX = dimMinusThree;
      sourceBottomRightY = dimMinusThree;
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

  private sizeOfBlackWhiteBlackRunBothWays(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ): number {
    let result = this.sizeOfBlackWhiteBlackRun(fromX, fromY, toX, toY);
    let scale = 1;
    let otherToX = fromX - (toX - fromX);
    if (otherToX < 0) {
      scale = fromX / (fromX - otherToX);
      otherToX = 0;
    } else if (otherToX >= this.image.getWidth()) {
      scale = (this.image.getWidth() - 1 - fromX) / (otherToX - fromX);
      otherToX = this.image.getWidth() - 1;
    }
    let otherToY = Math.floor(fromY - (toY - fromY) * scale);

    scale = 1;
    if (otherToY < 0) {
      scale = fromY / (fromY - otherToY);
      otherToY = 0;
    } else if (otherToY >= this.image.getHeight()) {
      scale = (this.image.getHeight() - 1 - fromY) / (otherToY - fromY);
      otherToY = this.image.getHeight() - 1;
    }
    otherToX = Math.floor(fromX + (otherToX - fromX) * scale);

    result += this.sizeOfBlackWhiteBlackRun(fromX, fromY, otherToX, otherToY);
    return result - 1;
  }

  private sizeOfBlackWhiteBlackRun(fromX: number, fromY: number, toX: number, toY: number): number {
    const steep = Math.abs(toY - fromY) > Math.abs(toX - fromX);
    if (steep) {
      let temp = fromX;
      fromX = fromY;
      fromY = temp;
      temp = toX;
      toX = toY;
      toY = temp;
    }

    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);
    let error = -dx / 2;
    const xstep = fromX < toX ? 1 : -1;
    const ystep = fromY < toY ? 1 : -1;

    let state = 0;
    const xLimit = toX + xstep;
    for (let x = fromX, y = fromY; x !== xLimit; x += xstep) {
      const realX = steep ? y : x;
      const realY = steep ? x : y;

      if (state === 1) {
        if (this.image.get(realX, realY)) state++;
      } else {
        if (!this.image.get(realX, realY)) state++;
      }

      if (state === 3) {
        const diffX = x - fromX;
        const diffY = y - fromY;
        return Math.sqrt(diffX * diffX + diffY * diffY);
      }
      error += dy;
      if (error > 0) {
        if (y === toY) break;
        y += ystep;
        error -= dx;
      }
    }

    if (state === 2) {
      const diffX = toX + xstep - fromX;
      const diffY = toY - fromY;
      return Math.sqrt(diffX * diffX + diffY * diffY);
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
