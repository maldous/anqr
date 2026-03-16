import { BitArray, BitMatrix } from "./bit-matrix";
import { NotFoundException } from "./exceptions";
import { Binarizer, type LuminanceSource } from "./luminance";

/**
 * Global histogram binarizer using image-wide threshold
 */
export class GlobalHistogramBinarizer extends Binarizer {
  private static readonly LUMINANCE_BITS = 5;
  private static readonly LUMINANCE_SHIFT = 8 - GlobalHistogramBinarizer.LUMINANCE_BITS;
  private static readonly LUMINANCE_BUCKETS = 1 << GlobalHistogramBinarizer.LUMINANCE_BITS;
  private static readonly EMPTY = Uint8ClampedArray.from([0]);

  private luminances: Uint8ClampedArray;
  private readonly buckets: Int32Array;

  constructor(source: LuminanceSource) {
    super(source);
    this.luminances = GlobalHistogramBinarizer.EMPTY;
    this.buckets = new Int32Array(GlobalHistogramBinarizer.LUMINANCE_BUCKETS);
  }

  getBlackRow(y: number, row: BitArray): BitArray {
    const source = this.getLuminanceSource();
    const width = source.getWidth();
    if (row === undefined || row === null || row.getSize() < width) {
      row = new BitArray(width);
    } else {
      row.clear();
    }

    this.initArrays(width);
    const localLuminances = source.getRow(y, this.luminances);
    const localBuckets = this.buckets;
    for (let x = 0; x < width; x++) {
      localBuckets[(localLuminances[x] & 0xff) >> GlobalHistogramBinarizer.LUMINANCE_SHIFT]++;
    }
    const blackPoint = GlobalHistogramBinarizer.estimateBlackPoint(localBuckets);

    if (width < 3) {
      for (let x = 0; x < width; x++) {
        if ((localLuminances[x] & 0xff) < blackPoint) {
          row.set(x);
        }
      }
    } else {
      let left = localLuminances[0] & 0xff;
      let center = localLuminances[1] & 0xff;
      for (let x = 1; x < width - 1; x++) {
        const right = localLuminances[x + 1] & 0xff;
        if ((center * 4 - left - right) / 2 < blackPoint) {
          row.set(x);
        }
        left = center;
        center = right;
      }
    }
    return row;
  }

  getBlackMatrix(): BitMatrix {
    const source = this.getLuminanceSource();
    const width = source.getWidth();
    const height = source.getHeight();
    const matrix = new BitMatrix(width, height);

    this.initArrays(width);
    const localBuckets = this.buckets;
    for (let y = 1; y < 5; y++) {
      const row = Math.floor((height * y) / 5);
      const localLuminances = source.getRow(row, this.luminances);
      const right = Math.floor((width * 4) / 5);
      for (let x = Math.floor(width / 5); x < right; x++) {
        const pixel = localLuminances[x] & 0xff;
        localBuckets[pixel >> GlobalHistogramBinarizer.LUMINANCE_SHIFT]++;
      }
    }
    const blackPoint = GlobalHistogramBinarizer.estimateBlackPoint(localBuckets);

    const localLuminances = source.getMatrix();
    for (let y = 0; y < height; y++) {
      const offset = y * width;
      for (let x = 0; x < width; x++) {
        const pixel = localLuminances[offset + x] & 0xff;
        if (pixel < blackPoint) {
          matrix.set(x, y);
        }
      }
    }
    return matrix;
  }

  createBinarizer(source: LuminanceSource): Binarizer {
    return new GlobalHistogramBinarizer(source);
  }

  private initArrays(luminanceSize: number): void {
    if (this.luminances.length < luminanceSize) {
      this.luminances = new Uint8ClampedArray(luminanceSize);
    }
    const buckets = this.buckets;
    for (let x = 0; x < GlobalHistogramBinarizer.LUMINANCE_BUCKETS; x++) {
      buckets[x] = 0;
    }
  }

  private static estimateBlackPoint(buckets: Int32Array): number {
    const numBuckets = buckets.length;
    let maxBucketCount = 0;
    let firstPeak = 0;
    let firstPeakSize = 0;
    for (let x = 0; x < numBuckets; x++) {
      if (buckets[x] > firstPeakSize) {
        firstPeak = x;
        firstPeakSize = buckets[x];
      }
      if (buckets[x] > maxBucketCount) {
        maxBucketCount = buckets[x];
      }
    }

    let secondPeak = 0;
    let secondPeakScore = 0;
    for (let x = 0; x < numBuckets; x++) {
      const distanceToBiggest = x - firstPeak;
      const score = buckets[x] * distanceToBiggest * distanceToBiggest;
      if (score > secondPeakScore) {
        secondPeak = x;
        secondPeakScore = score;
      }
    }

    if (firstPeak > secondPeak) {
      const temp = firstPeak;
      firstPeak = secondPeak;
      secondPeak = temp;
    }

    if (secondPeak - firstPeak <= numBuckets / 16) {
      throw new NotFoundException();
    }

    let bestValley = secondPeak - 1;
    let bestValleyScore = -1;
    for (let x = secondPeak - 1; x > firstPeak; x--) {
      const fromFirst = x - firstPeak;
      const score = fromFirst * fromFirst * (secondPeak - x) * (maxBucketCount - buckets[x]);
      if (score > bestValleyScore) {
        bestValley = x;
        bestValleyScore = score;
      }
    }
    return bestValley << GlobalHistogramBinarizer.LUMINANCE_SHIFT;
  }
}
