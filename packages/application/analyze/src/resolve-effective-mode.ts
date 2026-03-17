import type { ValidEncoderMode } from "./reproduction-types";

export function resolveEffectiveMode(
  encoderInputKind: "bytes" | "string",
  resultEncodingMode: string | null,
  modeToUse: ValidEncoderMode | undefined,
): ValidEncoderMode | undefined {
  if (encoderInputKind === "bytes") {
    return resultEncodingMode === "byte" ? "byte" : undefined;
  }

  return modeToUse;
}
