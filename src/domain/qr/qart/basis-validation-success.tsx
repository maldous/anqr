import { buildFullBasis } from './rs-basis';
import type { BitRange } from './semantic-layout';
import type { FullQArtResult } from './generate.types';

export interface BasisValidationSuccess {
  earlyReturn?: FullQArtResult;
  basis: ReturnType<typeof buildFullBasis>;
  actualControllableBits: number;
  actualControlPercentage: number;
  allowedBitRanges: BitRange[];
}
