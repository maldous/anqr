import { FinderPattern } from './finder-pattern';

/**
 * Finder pattern info (three finder patterns with metadata)
 */
export class FinderPatternInfo {
  constructor(
    private readonly bottomLeft: FinderPattern,
    private readonly topLeft: FinderPattern,
    private readonly topRight: FinderPattern
  ) {}

  getBottomLeft(): FinderPattern {
    return this.bottomLeft;
  }

  getTopLeft(): FinderPattern {
    return this.topLeft;
  }

  getTopRight(): FinderPattern {
    return this.topRight;
  }
}
