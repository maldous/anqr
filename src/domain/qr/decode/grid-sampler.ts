import { BitMatrix } from "./bit-matrix";
import { NotFoundException } from "./exceptions";
import { PerspectiveTransform } from "./perspective-transform";
import type { SampleGridArgs } from "./sample-grid-args.type";

/**
 * Abstract grid sampler
 */
export abstract class GridSampler {
  abstract sampleGrid(...args: SampleGridArgs): BitMatrix;

  abstract sampleGridWithTransform(
    image: BitMatrix,
    dimensionX: number,
    dimensionY: number,
    transform: PerspectiveTransform,
  ): BitMatrix;

  private static nudgePoint(
    points: Float32Array,
    offset: number,
    width: number,
    height: number,
  ): boolean {
    const x = Math.floor(points[offset]);
    const y = Math.floor(points[offset + 1]);
    if (x < -1 || x > width || y < -1 || y > height) {
      throw new NotFoundException();
    }
    let nudged = false;
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
    return nudged;
  }

  protected static checkAndNudgePoints(image: BitMatrix, points: Float32Array): void {
    const width = image.getWidth();
    const height = image.getHeight();

    let nudged = true;
    for (let offset = 0; offset < points.length && nudged; offset += 2) {
      nudged = GridSampler.nudgePoint(points, offset, width, height);
    }

    nudged = true;
    for (let offset = points.length - 2; offset >= 0 && nudged; offset -= 2) {
      nudged = GridSampler.nudgePoint(points, offset, width, height);
    }
  }
}
