import type { QRGeneratorConfig } from "@/domain/qr/generator-types";
import { getEccWeight } from "./get-ecc-weight";

/**
 * Check if modifying a module is safe given ECC-aware constraints
 * Uses deterministic decision based on position hash for reproducibility
 */
export function isEccSafeToModify(
  row: number,
  col: number,
  moduleCount: number,
  version: number,
  config: QRGeneratorConfig,
  modifiedCount: number,
  totalDataModules: number,
): boolean {
  if (!config.eccAwareEnabled) return true;

  const riskBudget = (config.eccAwareRiskBudget || 50) / 100;
  const eccCapacity: Record<string, number> = { L: 0.07, M: 0.15, Q: 0.25, H: 0.3 };
  const maxRisk = eccCapacity[config.errorCorrection] || 0.25;
  const allowedModifications = Math.floor(totalDataModules * maxRisk * riskBudget);

  if (modifiedCount >= allowedModifications) return false;

  const weight = getEccWeight(
    row,
    col,
    moduleCount,
    version,
    config.eccAwareWeightMap || "distance_to_finders",
  );

  // Use deterministic decision based on position hash for reproducibility
  const positionHash = ((row * 31 + col) * 17 + (config.seed || 0)) % 1000;
  const deterministicValue = positionHash / 1000;

  // Higher weight modules are less likely to be modified
  return deterministicValue > weight * 0.5;
}
