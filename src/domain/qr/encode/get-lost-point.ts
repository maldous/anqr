import type { QRCodeInstance } from '../../../modules/qr-encoder/types';
import { penaltyLevel1AdjacentModules, penaltyLevel2Blocks, penaltyLevel3FinderLike, penaltyLevel4Ratio } from './utils._internal';

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
