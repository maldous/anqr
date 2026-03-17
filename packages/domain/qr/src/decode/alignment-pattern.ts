import { ResultPoint } from "./result-types";
import { patternAboutEquals } from "./pattern-about-equals";

/**
 * Alignment pattern (smaller squares in larger QR codes)
 */
export class AlignmentPattern extends ResultPoint {
  constructor(
    posX: number,
    posY: number,
    private readonly estimatedModuleSize: number,
  ) {
    super(posX, posY);
  }

  aboutEquals(moduleSize: number, i: number, j: number): boolean {
    return patternAboutEquals(this.getX(), this.getY(), this.estimatedModuleSize, moduleSize, i, j);
  }

  combineEstimate(i: number, j: number, newModuleSize: number): AlignmentPattern {
    const combinedX = (this.getX() + j) / 2;
    const combinedY = (this.getY() + i) / 2;
    const combinedModuleSize = (this.estimatedModuleSize + newModuleSize) / 2;
    return new AlignmentPattern(combinedX, combinedY, combinedModuleSize);
  }
}
