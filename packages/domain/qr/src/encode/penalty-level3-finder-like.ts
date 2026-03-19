import type { QRCodeInstance } from "./types";
import { penaltyLevel3Horizontal } from "./penalty-level3-horizontal";
import { penaltyLevel3Vertical } from "./penalty-level3-vertical";

// LEVEL3: Finder-like patterns
export function penaltyLevel3FinderLike(qrcode: QRCodeInstance, moduleCount: number): number {
  return penaltyLevel3Horizontal(qrcode, moduleCount) + penaltyLevel3Vertical(qrcode, moduleCount);
}
