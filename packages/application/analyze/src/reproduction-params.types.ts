import type { ECCLevel } from "@/modules/qr-analyzer";
import type { ValidEncoderMode } from "./valid-encoder-mode";

export interface ReproductionParams {
  ecc: ECCLevel;
  isGeneratorSource: boolean;
  versionToUse: number | null;
  maskToUse: number | undefined;
  modeToUse: ValidEncoderMode | undefined;
}
