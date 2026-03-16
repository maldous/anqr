import { MathUtils } from "./perspective";
import { Float } from "./util";

/**
 * Represents a point of interest in an image
 */
export class ResultPoint {
  constructor(
    private readonly x: number,
    private readonly y: number,
  ) {}

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }

  equals(other: unknown): boolean {
    if (other instanceof ResultPoint) {
      return this.x === other.x && this.y === other.y;
    }
    return false;
  }

  hashCode(): number {
    return 31 * Float.floatToIntBits(this.x) + Float.floatToIntBits(this.y);
  }

  toString(): string {
    return `(${this.x},${this.y})`;
  }

  static orderBestPatterns(patterns: ResultPoint[]): void {
    const zeroOneDistance = ResultPoint.distance(patterns[0], patterns[1]);
    const oneTwoDistance = ResultPoint.distance(patterns[1], patterns[2]);
    const zeroTwoDistance = ResultPoint.distance(patterns[0], patterns[2]);

    let pointA: ResultPoint;
    let pointB: ResultPoint;
    let pointC: ResultPoint;

    if (oneTwoDistance >= zeroOneDistance && oneTwoDistance >= zeroTwoDistance) {
      pointB = patterns[0];
      pointA = patterns[1];
      pointC = patterns[2];
    } else if (zeroTwoDistance >= oneTwoDistance && zeroTwoDistance >= zeroOneDistance) {
      pointB = patterns[1];
      pointA = patterns[0];
      pointC = patterns[2];
    } else {
      pointB = patterns[2];
      pointA = patterns[0];
      pointC = patterns[1];
    }

    if (ResultPoint.crossProductZ(pointA, pointB, pointC) < 0) {
      const temp = pointA;
      pointA = pointC;
      pointC = temp;
    }

    patterns[0] = pointA;
    patterns[1] = pointB;
    patterns[2] = pointC;
  }

  static distance(pattern1: ResultPoint, pattern2: ResultPoint): number {
    return MathUtils.distance(pattern1.x, pattern1.y, pattern2.x, pattern2.y);
  }

  private static crossProductZ(
    pointA: ResultPoint,
    pointB: ResultPoint,
    pointC: ResultPoint,
  ): number {
    const bX = pointB.x;
    const bY = pointB.y;
    return (pointC.x - bX) * (pointA.y - bY) - (pointC.y - bY) * (pointA.x - bX);
  }
}
