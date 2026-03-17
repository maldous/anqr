import type { ECCLevel } from "@/modules/qr-analyzer";
import { optimizeSegments } from "@/modules/qr-encoder";
import type { ValidEncoderMode } from "./reproduction-types";
import { createQrWithVersionFallback } from "./create-qr-with-version-fallback";
import { tryCreateQr } from "./try-create-qr";

export function createQRWithFallback(
  data: string,
  ecc: ECCLevel,
  version: number,
  effectiveMode: ValidEncoderMode | undefined,
  maskToUse: number | undefined,
) {
  try {
    return tryCreateQr(data, ecc, version, effectiveMode, maskToUse);
  } catch (encoderError) {
    const errorMessage =
      encoderError instanceof Error ? encoderError.message : String(encoderError);
    if (!errorMessage.includes("overflow")) {
      throw encoderError;
    }

    const segments = optimizeSegments(data);
    const canUseMixed =
      segments.length > 1 || (segments.length === 1 && segments[0].mode !== "byte");
    if (canUseMixed) {
      try {
        return tryCreateQr(data, ecc, version, "mixed", maskToUse);
      } catch {
        // fall through
      }
    }

    return createQrWithVersionFallback(data, ecc, version, maskToUse);
  }
}
