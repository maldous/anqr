import { BitMatrix } from './bit-matrix';
import { NotFoundException } from './exceptions';
import { GridSampler } from './grid-sampler';
import { PerspectiveTransform } from './perspective-transform';
import type { SampleGridArgs } from './sample-grid-args.type';

/**
 * Default grid sampler implementation
 */
export class DefaultGridSampler extends GridSampler {
  sampleGrid(...args: SampleGridArgs): BitMatrix {
    const [
      image,
      dimensionX,
      dimensionY,
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
      p4FromY,
    ] = args;
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
      } catch {
        throw new NotFoundException();
      }
    }
    return bits;
  }
}
