import type { QRCodeInstance } from "../qr-encoder/types";
import { penaltyLevel1AdjacentModules } from "./penalty-level1-adjacent-modules";
import { penaltyLevel2Blocks } from "./penalty-level2-blocks";
import { penaltyLevel3FinderLike } from "./penalty-level3-finder-like";
import { penaltyLevel4Ratio } from "./penalty-level4-ratio";

/**
 * Calculate penalty score for mask pattern selection
 */
export function getLostPoint(qrcode: QRCodeInstance): number {
  const moduleCount = qrcode.getModuleCount();
  return (
    penaltyLevel1AdjacentModules(qrcode, moduleCount) +
    penaltyLevel2Blocks(qrcode, moduleCount) +
    penaltyLevel3FinderLike(qrcode, moduleCount) +
    penaltyLevel4Ratio(qrcode, moduleCount)
  );
}
