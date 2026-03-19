import type { CharacterEncoding } from "./character-encoding.contract";
import type { ECCLevel } from "./ecc-level.contract";
import type { EncodingMode } from "./encoding-mode.contract";
import type { MaskPattern } from "./mask-pattern.contract";

export interface QRCoreOptions {
  version: number;
  ecc: ECCLevel;
  encodingMode: EncodingMode;
  maskPattern: MaskPattern;
  characterEncoding: CharacterEncoding;
  quietZoneModules: number;
  quietZoneMinEnforce: boolean;
  borderModulesExtra: number;
}
