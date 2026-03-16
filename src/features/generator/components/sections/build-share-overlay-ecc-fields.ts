import type { StoreState } from "./share-config-store.types";

export function buildShareOverlayEccFields(overlay: StoreState["overlay"]) {
  return {
    eccAwareEnabled: overlay.eccAwareEnabled ? true : undefined,
    eccAwareRiskBudget:
      overlay.eccAwareEnabled && overlay.eccAwareRiskBudget !== 50
        ? overlay.eccAwareRiskBudget
        : undefined,
    eccAwareWeightMap:
      overlay.eccAwareEnabled && overlay.eccAwareWeightMap !== "distance_to_finders"
        ? overlay.eccAwareWeightMap
        : undefined,
  };
}
