import type { QRAnalysisResult } from "@/contracts/analyze";
import type { ReproductionQrState, ValidEncoderMode } from "./reproduction-types";

export function resolveMode(
  isGeneratorSource: boolean,
  result: QRAnalysisResult,
  qrState: ReproductionQrState,
): ValidEncoderMode | undefined {
  const candidate = isGeneratorSource ? qrState.encodingMode : result.encodingMode;

  if (
    candidate === "numeric" ||
    candidate === "alphanumeric" ||
    candidate === "byte" ||
    candidate === "kanji" ||
    candidate === "auto"
  ) {
    return candidate;
  }

  return undefined;
}
