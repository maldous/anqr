import { BitMatrix } from "./bit-matrix";
import { Binarizer, type LuminanceSource } from "./luminance";
import { GlobalHistogramBinarizer } from "./global-histogram-binarizer";

/**
 * Hybrid binarizer using local thresholding for better results
 */
export class HybridBinarizer extends GlobalHistogramBinarizer {
  private static readonly BLOCK_SIZE_POWER = 3;
  private static readonly BLOCK_SIZE = 1 << HybridBinarizer.BLOCK_SIZE_POWER;
  private static readonly BLOCK_SIZE_MASK = HybridBinarizer.BLOCK_SIZE - 1;
  private static readonly MINIMUM_DIMENSION = HybridBinarizer.BLOCK_SIZE * 5;
  private static readonly MIN_DYNAMIC_RANGE = 24;

  private matrix: BitMatrix | null = null;

  getBlackMatrix(): BitMatrix {
    if (this.matrix !== null) {
      return this.matrix;
    }
    const source = this.getLuminanceSource();
    const width = source.getWidth();
    const height = source.getHeight();
    if (width >= HybridBinarizer.MINIMUM_DIMENSION && height >= HybridBinarizer.MINIMUM_DIMENSION) {
      const luminances = source.getMatrix();
      let subWidth = width >> HybridBinarizer.BLOCK_SIZE_POWER;
      if ((width & HybridBinarizer.BLOCK_SIZE_MASK) !== 0) subWidth++;
      let subHeight = height >> HybridBinarizer.BLOCK_SIZE_POWER;
      if ((height & HybridBinarizer.BLOCK_SIZE_MASK) !== 0) subHeight++;
      const blackPoints = HybridBinarizer.calculateBlackPoints(
        luminances,
        subWidth,
        subHeight,
        width,
        height,
      );

      const newMatrix = new BitMatrix(width, height);
      HybridBinarizer.calculateThresholdForBlock(
        luminances,
        subWidth,
        subHeight,
        width,
        height,
        blackPoints,
        newMatrix,
      );
      this.matrix = newMatrix;
    } else {
      this.matrix = super.getBlackMatrix();
    }
    return this.matrix;
  }

  createBinarizer(source: LuminanceSource): Binarizer {
    return new HybridBinarizer(source);
  }

  private static calculateThresholdForBlock(
    luminances: Uint8ClampedArray,
    subWidth: number,
    subHeight: number,
    width: number,
    height: number,
    blackPoints: Int32Array[],
    matrix: BitMatrix,
  ): void {
    const maxYOffset = height - HybridBinarizer.BLOCK_SIZE;
    const maxXOffset = width - HybridBinarizer.BLOCK_SIZE;
    for (let y = 0; y < subHeight; y++) {
      let yoffset = y << HybridBinarizer.BLOCK_SIZE_POWER;
      if (yoffset > maxYOffset) yoffset = maxYOffset;
      const top = HybridBinarizer.cap(y, 2, subHeight - 3);
      for (let x = 0; x < subWidth; x++) {
        let xoffset = x << HybridBinarizer.BLOCK_SIZE_POWER;
        if (xoffset > maxXOffset) xoffset = maxXOffset;
        const left = HybridBinarizer.cap(x, 2, subWidth - 3);
        let sum = 0;
        for (let z = -2; z <= 2; z++) {
          const blackRow = blackPoints[top + z];
          sum +=
            blackRow[left - 2] +
            blackRow[left - 1] +
            blackRow[left] +
            blackRow[left + 1] +
            blackRow[left + 2];
        }
        const average = sum / 25;
        HybridBinarizer.thresholdBlock(luminances, xoffset, yoffset, average, width, matrix);
      }
    }
  }

  private static cap(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private static thresholdBlock(
    luminances: Uint8ClampedArray,
    xoffset: number,
    yoffset: number,
    threshold: number,
    stride: number,
    matrix: BitMatrix,
  ): void {
    for (
      let y = 0, offset = yoffset * stride + xoffset;
      y < HybridBinarizer.BLOCK_SIZE;
      y++, offset += stride
    ) {
      for (let x = 0; x < HybridBinarizer.BLOCK_SIZE; x++) {
        if ((luminances[offset + x] & 0xff) <= threshold) {
          matrix.set(xoffset + x, yoffset + y);
        }
      }
    }
  }

  private static sumRemainingRows(
    luminances: Uint8ClampedArray,
    offset: number,
    yy: number,
    width: number,
  ): number {
    let sum = 0;
    let row = yy;
    let off = offset;
    while (row < HybridBinarizer.BLOCK_SIZE) {
      for (let xx = 0; xx < HybridBinarizer.BLOCK_SIZE; xx++) {
        sum += luminances[off + xx] & 0xff;
      }
      row++;
      off += width;
    }
    return sum;
  }

  private static calculateBlockStats(
    luminances: Uint8ClampedArray,
    xoffset: number,
    yoffset: number,
    width: number,
  ): { sum: number; min: number; max: number } {
    let sum = 0;
    let min = 0xff;
    let max = 0;
    let yy = 0;
    let offset = yoffset * width + xoffset;
    while (yy < HybridBinarizer.BLOCK_SIZE) {
      for (let xx = 0; xx < HybridBinarizer.BLOCK_SIZE; xx++) {
        const pixel = luminances[offset + xx] & 0xff;
        sum += pixel;
        if (pixel < min) min = pixel;
        if (pixel > max) max = pixel;
      }
      if (max - min > HybridBinarizer.MIN_DYNAMIC_RANGE) {
        yy++;
        offset += width;
        sum += HybridBinarizer.sumRemainingRows(luminances, offset, yy, width);
        break;
      }
      yy++;
      offset += width;
    }
    return { sum, min, max };
  }

  private static computeBlockBlackPoint(
    stats: { sum: number; min: number; max: number },
    y: number,
    x: number,
    blackPoints: Int32Array[],
  ): number {
    let average = stats.sum >> (HybridBinarizer.BLOCK_SIZE_POWER * 2);
    if (stats.max - stats.min <= HybridBinarizer.MIN_DYNAMIC_RANGE) {
      average = stats.min / 2;
      if (y > 0 && x > 0) {
        const averageNeighborBlackPoint =
          (blackPoints[y - 1][x] + 2 * blackPoints[y][x - 1] + blackPoints[y - 1][x - 1]) / 4;
        if (stats.min < averageNeighborBlackPoint) {
          average = averageNeighborBlackPoint;
        }
      }
    }
    return average;
  }

  private static calculateBlackPoints(
    luminances: Uint8ClampedArray,
    subWidth: number,
    subHeight: number,
    width: number,
    height: number,
  ): Int32Array[] {
    const maxYOffset = height - HybridBinarizer.BLOCK_SIZE;
    const maxXOffset = width - HybridBinarizer.BLOCK_SIZE;
    const blackPoints: Int32Array[] = Array.from({ length: subHeight });

    for (let y = 0; y < subHeight; y++) {
      blackPoints[y] = new Int32Array(subWidth);
      let yoffset = y << HybridBinarizer.BLOCK_SIZE_POWER;
      if (yoffset > maxYOffset) yoffset = maxYOffset;
      for (let x = 0; x < subWidth; x++) {
        let xoffset = x << HybridBinarizer.BLOCK_SIZE_POWER;
        if (xoffset > maxXOffset) xoffset = maxXOffset;

        const stats = HybridBinarizer.calculateBlockStats(luminances, xoffset, yoffset, width);
        blackPoints[y][x] = HybridBinarizer.computeBlockBlackPoint(stats, y, x, blackPoints);
      }
    }
    return blackPoints;
  }
}
