/**
 * Calculate ECC-aware weight for a module position
 * Higher weight = more important to preserve
 */
export function getEccWeight(
  row: number,
  col: number,
  moduleCount: number,
  _version: number,
  weightMap: string
): number {
  switch (weightMap) {
    case 'distance_to_finders': {
      // Closer to finders = more important
      const distTL = Math.hypot(row, col);
      const distTR = Math.hypot(row, moduleCount - 1 - col);
      const distBL = Math.hypot(moduleCount - 1 - row, col);
      const minDist = Math.min(distTL, distTR, distBL);
      const maxDist = (Math.sqrt(2) * moduleCount) / 2;
      return 1 - minDist / maxDist;
    }

    case 'block_heatmap': {
      // Center blocks are less critical than edge blocks
      const centerRow = moduleCount / 2;
      const centerCol = moduleCount / 2;
      const distToCenter = Math.hypot(row - centerRow, col - centerCol);
      const maxDist = (Math.sqrt(2) * moduleCount) / 2;
      return distToCenter / maxDist;
    }

    case 'empirical_scan_heatmap': {
      // Simulate typical scanner patterns - top-left to bottom-right priority
      const scanProgress = (row + col) / (2 * moduleCount);
      // Earlier in scan = more important
      return 1 - scanProgress * 0.5;
    }

    default:
      return 0.5;
  }
}
