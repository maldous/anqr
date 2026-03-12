import { BitMatrix } from './bit-matrix';
import { NotFoundException } from './exceptions';
import { GridSampler } from './grid-sampler';
import { PerspectiveTransform } from './perspective-transform';

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
      } catch {
        throw new NotFoundException();
      }
    }
    return bits;
  }
}
