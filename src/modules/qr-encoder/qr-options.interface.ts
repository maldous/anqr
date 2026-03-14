import type { ECCLevel } from './ecc-level';
import type { EncodingMode } from './encoding-mode';
import type { MaskPattern } from './mask-pattern';

export interface QROptions {
  errorCorrectionLevel?: ECCLevel;
  version?: number;
  maskPattern?: MaskPattern;
  mode?: EncodingMode;
}
