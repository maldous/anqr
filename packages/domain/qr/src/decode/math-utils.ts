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
    return Math.hypot(xDiff, yDiff);
  }

  static sum(array: Int32Array): number {
    let count = 0;
    for (const a of array) count += a;
    return count;
  }
}
