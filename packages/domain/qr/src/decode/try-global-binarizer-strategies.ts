import { createLogger } from "../../../../observability/logging/src";
import type { DecodeResult } from "@/modules/qr-decoder/types";
import { DecodeHintType } from "./result-types";
import { tryDecodeWithGlobalBinarizer } from "./try-decode-with-global-binarizer";

const qrDecoderLog = createLogger("DECODER");

export function tryGlobalBinarizerStrategies(
  imageData: ImageData,
  inversionAttempts: string,
  hints: Map<DecodeHintType, unknown>,
): DecodeResult | null {
  if (inversionAttempts !== "onlyInvert") {
    qrDecoderLog.trace("strategy: Trying Normal + GlobalHistogramBinarizer");
    const result = tryDecodeWithGlobalBinarizer(imageData, false, hints);
    if (result) return result;
  }
  if (inversionAttempts !== "dontInvert") {
    qrDecoderLog.trace("strategy: Trying Inverted + GlobalHistogramBinarizer");
    const result = tryDecodeWithGlobalBinarizer(imageData, true, hints);
    if (result) return result;
  }
  return null;
}
