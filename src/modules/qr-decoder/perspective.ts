/**
 * QR Decoder Perspective Transform
 * Perspective transformation and grid sampling
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('DECODER');

import { BitMatrix } from './bit-matrix';
import { NotFoundException } from './exceptions';

/**
 * Perspective transform for quadrilateral to quadrilateral mapping
 */
export class PerspectiveTransform {
  private constructor(
    private a11: number,
    private a21: number,
    private a31: number,
    private a12: number,
    private a22: number,
    private a32: number,
    private a13: number,
    private a23: number,
    private a33: number
  ) {}

  static quadrilateralToQuadrilateral(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    x0p: number,
    y0p: number,
    x1p: number,
    y1p: number,
    x2p: number,
    y2p: number,
    x3p: number,
    y3p: number
  ): PerspectiveTransform {
    const qToS = PerspectiveTransform.quadrilateralToSquare(x0, y0, x1, y1, x2, y2, x3, y3);
    const sToQ = PerspectiveTransform.squareToQuadrilateral(x0p, y0p, x1p, y1p, x2p, y2p, x3p, y3p);
    return sToQ.times(qToS);
  }

  transformPoints(points: Float32Array): void {
    const { a11, a12, a13, a21, a22, a23, a31, a32, a33 } = this;
    for (let i = 0; i < points.length; i += 2) {
      const x = points[i];
      const y = points[i + 1];
      const denominator = a13 * x + a23 * y + a33;
      points[i] = (a11 * x + a21 * y + a31) / denominator;
      points[i + 1] = (a12 * x + a22 * y + a32) / denominator;
    }
  }

  transformPointsWithValues(xValues: Float32Array, yValues: Float32Array): void {
    const { a11, a12, a13, a21, a22, a23, a31, a32, a33 } = this;
    const n = xValues.length;
    for (let i = 0; i < n; i++) {
      const x = xValues[i];
      const y = yValues[i];
      const denominator = a13 * x + a23 * y + a33;
      xValues[i] = (a11 * x + a21 * y + a31) / denominator;
      yValues[i] = (a12 * x + a22 * y + a32) / denominator;
    }
  }

  static squareToQuadrilateral(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number
  ): PerspectiveTransform {
    const dx3 = x0 - x1 + x2 - x3;
    const dy3 = y0 - y1 + y2 - y3;

    if (dx3 === 0 && dy3 === 0) {
      return new PerspectiveTransform(x1 - x0, x2 - x1, x0, y1 - y0, y2 - y1, y0, 0, 0, 1);
    } else {
      const dx1 = x1 - x2;
      const dx2 = x3 - x2;
      const dy1 = y1 - y2;
      const dy2 = y3 - y2;
      const denominator = dx1 * dy2 - dx2 * dy1;
      const a13 = (dx3 * dy2 - dx2 * dy3) / denominator;
      const a23 = (dx1 * dy3 - dx3 * dy1) / denominator;
      return new PerspectiveTransform(
        x1 - x0 + a13 * x1,
        x3 - x0 + a23 * x3,
        x0,
        y1 - y0 + a13 * y1,
        y3 - y0 + a23 * y3,
        y0,
        a13,
        a23,
        1
      );
    }
  }

  static quadrilateralToSquare(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number
  ): PerspectiveTransform {
    return PerspectiveTransform.squareToQuadrilateral(
      x0,
      y0,
      x1,
      y1,
      x2,
      y2,
      x3,
      y3
    ).buildAdjoint();
  }

  protected buildAdjoint(): PerspectiveTransform {
    return new PerspectiveTransform(
      this.a22 * this.a33 - this.a23 * this.a32,
      this.a23 * this.a31 - this.a21 * this.a33,
      this.a21 * this.a32 - this.a22 * this.a31,
      this.a13 * this.a32 - this.a12 * this.a33,
      this.a11 * this.a33 - this.a13 * this.a31,
      this.a12 * this.a31 - this.a11 * this.a32,
      this.a12 * this.a23 - this.a13 * this.a22,
      this.a13 * this.a21 - this.a11 * this.a23,
      this.a11 * this.a22 - this.a12 * this.a21
    );
  }

  protected times(other: PerspectiveTransform): PerspectiveTransform {
    return new PerspectiveTransform(
      this.a11 * other.a11 + this.a21 * other.a12 + this.a31 * other.a13,
      this.a11 * other.a21 + this.a21 * other.a22 + this.a31 * other.a23,
      this.a11 * other.a31 + this.a21 * other.a32 + this.a31 * other.a33,
      this.a12 * other.a11 + this.a22 * other.a12 + this.a32 * other.a13,
      this.a12 * other.a21 + this.a22 * other.a22 + this.a32 * other.a23,
      this.a12 * other.a31 + this.a22 * other.a32 + this.a32 * other.a33,
      this.a13 * other.a11 + this.a23 * other.a12 + this.a33 * other.a13,
      this.a13 * other.a21 + this.a23 * other.a22 + this.a33 * other.a23,
      this.a13 * other.a31 + this.a23 * other.a32 + this.a33 * other.a33
    );
  }
}

/**
 * Abstract grid sampler
 */
export abstract class GridSampler {
  abstract sampleGrid(
    image: BitMatrix,
    dimensionX: number,
    dimensionY: number,
    p1ToX: number,
    p1ToY: number,
    p2ToX: number,
    p2ToY: number,
    p3ToX: number,
    p3ToY: number,
    p4ToX: number,
    p4ToY: number,
    p1FromX: number,
    p1FromY: number,
    p2FromX: number,
    p2FromY: number,
    p3FromX: number,
    p3FromY: number,
    p4FromX: number,
    p4FromY: number
  ): BitMatrix;

  abstract sampleGridWithTransform(
    image: BitMatrix,
    dimensionX: number,
    dimensionY: number,
    transform: PerspectiveTransform
  ): BitMatrix;

  protected static checkAndNudgePoints(image: BitMatrix, points: Float32Array): void {
    const width = image.getWidth();
    const height = image.getHeight();

    let nudged = true;
    for (let offset = 0; offset < points.length && nudged; offset += 2) {
      const x = Math.floor(points[offset]);
      const y = Math.floor(points[offset + 1]);
      if (x < -1 || x > width || y < -1 || y > height) {
        throw new NotFoundException();
      }
      nudged = false;
      if (x === -1) {
        points[offset] = 0;
        nudged = true;
      } else if (x === width) {
        points[offset] = width - 1;
        nudged = true;
      }
      if (y === -1) {
        points[offset + 1] = 0;
        nudged = true;
      } else if (y === height) {
        points[offset + 1] = height - 1;
        nudged = true;
      }
    }

    nudged = true;
    for (let offset = points.length - 2; offset >= 0 && nudged; offset -= 2) {
      const x = Math.floor(points[offset]);
      const y = Math.floor(points[offset + 1]);
      if (x < -1 || x > width || y < -1 || y > height) {
        throw new NotFoundException();
      }
      nudged = false;
      if (x === -1) {
        points[offset] = 0;
        nudged = true;
      } else if (x === width) {
        points[offset] = width - 1;
        nudged = true;
      }
      if (y === -1) {
        points[offset + 1] = 0;
        nudged = true;
      } else if (y === height) {
        points[offset + 1] = height - 1;
        nudged = true;
      }
    }
  }
}

/**
 * Default grid sampler implementation
 */
export class DefaultGridSampler extends GridSampler {
  sampleGrid(
    image: BitMatrix,
    dimensionX: number,
    dimensionY: number,
    p1ToX: number,
    p1ToY: number,
    p2ToX: number,
    p2ToY: number,
    p3ToX: number,
    p3ToY: number,
    p4ToX: number,
    p4ToY: number,
    p1FromX: number,
    p1FromY: number,
    p2FromX: number,
    p2FromY: number,
    p3FromX: number,
    p3FromY: number,
    p4FromX: number,
    p4FromY: number
  ): BitMatrix {
    const transform = PerspectiveTransform.quadrilateralToQuadrilateral(
      p1ToX,
      p1ToY,
      p2ToX,
      p2ToY,
      p3ToX,
      p3ToY,
      p4ToX,
      p4ToY,
      p1FromX,
      p1FromY,
      p2FromX,
      p2FromY,
      p3FromX,
      p3FromY,
      p4FromX,
      p4FromY
    );
    return this.sampleGridWithTransform(image, dimensionX, dimensionY, transform);
  }

  sampleGridWithTransform(
    image: BitMatrix,
    dimensionX: number,
    dimensionY: number,
    transform: PerspectiveTransform
  ): BitMatrix {
    if (dimensionX <= 0 || dimensionY <= 0) {
      throw new NotFoundException();
    }
    const bits = new BitMatrix(dimensionX, dimensionY);
    const points = new Float32Array(2 * dimensionX);
    for (let y = 0; y < dimensionY; y++) {
      const max = points.length;
      const iValue = y + 0.5;
      for (let x = 0; x < max; x += 2) {
        points[x] = x / 2 + 0.5;
        points[x + 1] = iValue;
      }
      transform.transformPoints(points);
      GridSampler.checkAndNudgePoints(image, points);
      try {
        for (let x = 0; x < max; x += 2) {
          if (image.get(Math.floor(points[x]), Math.floor(points[x + 1]))) {
            bits.set(x / 2, y);
          }
        }
      } catch (_e) {
        throw new NotFoundException();
      }
    }
    return bits;
  }
}

/**
 * Math utilities for detection
 */
// biome-ignore lint/complexity/noStaticOnlyClass: Ported from ZXing Java library, maintaining original structure
export class MathUtils {
  static round(d: number): number {
    return Math.round(d);
  }

  static distance(aX: number, aY: number, bX: number, bY: number): number {
    const xDiff = aX - bX;
    const yDiff = aY - bY;
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
  }

  static sum(array: Int32Array): number {
    let count = 0;
    for (const a of array) count += a;
    return count;
  }
}
