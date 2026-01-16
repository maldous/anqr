/**
 * QR Generator ECC Awareness Module
 * Handles error correction constraint checking for safe module modification
 */

/**
 * Calculate ECC-aware weight for a module position
 * Higher weight = more important to preserve
 */
export function getEccWeight(row, col, moduleCount, version, weightMap) {
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

/**
 * Check if modifying a module is safe given ECC-aware constraints
 * Uses deterministic decision based on position hash for reproducibility
 */
export function isEccSafeToModify(
  row,
  col,
  moduleCount,
  version,
  config,
  modifiedCount,
  totalDataModules
) {
  if (!config.eccAwareEnabled) return true;

  const riskBudget = (config.eccAwareRiskBudget || 50) / 100;
  const eccCapacity = { L: 0.07, M: 0.15, Q: 0.25, H: 0.3 };
  const maxRisk = eccCapacity[config.errorCorrection] || 0.25;
  const allowedModifications = Math.floor(totalDataModules * maxRisk * riskBudget);

  if (modifiedCount >= allowedModifications) return false;

  const weight = getEccWeight(
    row,
    col,
    moduleCount,
    version,
    config.eccAwareWeightMap || 'distance_to_finders'
  );

  // Use deterministic decision based on position hash for reproducibility
  // This replaces Math.random() to ensure same settings = same output
  const positionHash = ((row * 31 + col) * 17 + (config.seed || 0)) % 1000;
  const deterministicValue = positionHash / 1000;

  // Higher weight modules are less likely to be modified
  return deterministicValue > weight * 0.5;
}
