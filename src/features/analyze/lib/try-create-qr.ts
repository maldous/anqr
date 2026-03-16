import type { ECCLevel } from "@/modules/qr-analyzer";
import { createQRInstance } from "@/modules/qr-encoder";
import type { ValidEncoderMode } from "./reproduction-types";
import { buildMaskPatternOption } from "./build-mask-pattern-option";

export function tryCreateQr(
  data: string,
  ecc: ECCLevel,
  version: number,
  mode: ValidEncoderMode | "mixed" | undefined,
  maskToUse: number | undefined,
) {
  return {
    qr: createQRInstance(data, ecc, version, {
      ...(mode ? { mode } : {}),
      ...buildMaskPatternOption(maskToUse),
    }),
    actualVersionUsed: version,
  };
}
