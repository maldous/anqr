import { ResultPoint } from './result-types';
import { patternAboutEquals } from './pattern-about-equals';

/**
 * Finder pattern (one of three corner squares)
 */
export class FinderPattern extends ResultPoint {
  constructor(
    posX: number,
    posY: number,
    private readonly estimatedModuleSize: number,
    private count: number = 1
  ) {
    super(posX, posY);
  }

  getEstimatedModuleSize(): number {
    return this.estimatedModuleSize;
  }

  getCount(): number {
    return this.count;
  }

  incrementCount(): void {
    this.count++;
  }

  aboutEquals(moduleSize: number, i: number, j: number): boolean {
    return patternAboutEquals(this.getX(), this.getY(), this.estimatedModuleSize, moduleSize, i, j);
  }

  combineEstimate(i: number, j: number, newModuleSize: number): FinderPattern {
    const combinedCount = this.count + 1;
    const combinedX = (this.count * this.getX() + j) / combinedCount;
    const combinedY = (this.count * this.getY() + i) / combinedCount;
    const combinedModuleSize =
      (this.count * this.estimatedModuleSize + newModuleSize) / combinedCount;
    return new FinderPattern(combinedX, combinedY, combinedModuleSize, combinedCount);
  }
}
