import { ECB } from "./ecb";

/**
 * Error correction blocks for a version/level
 */
export class ECBlocks {
  private readonly ecBlocks: ECB[];

  constructor(
    private readonly ecCodewordsPerBlock: number,
    ...ecBlocks: ECB[]
  ) {
    this.ecBlocks = ecBlocks;
  }

  getECCodewordsPerBlock(): number {
    return this.ecCodewordsPerBlock;
  }

  getNumBlocks(): number {
    let total = 0;
    for (const ecBlock of this.ecBlocks) {
      total += ecBlock.getCount();
    }
    return total;
  }

  getTotalECCodewords(): number {
    return this.ecCodewordsPerBlock * this.getNumBlocks();
  }

  getECBlocks(): ECB[] {
    return this.ecBlocks;
  }
}
