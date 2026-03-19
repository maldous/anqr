import type { ECCLevel } from "@/contracts/analyze";
import type { ValidEncoderMode } from "./valid-encoder-mode";

export interface ReproductionParams {
  ecc: ECCLevel;
  isGeneratorSource: boolean;
  versionToUse: number | null;
  maskToUse: number | undefined;
  modeToUse: ValidEncoderMode | undefined;
}
