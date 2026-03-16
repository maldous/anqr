/**
 * QR Decoder Adapter
 * Provides DecodeResult interface using consolidated decoder modules.
 */

import { qrDecoderLog } from "./decoder-log";
import { decodeQR as customDecodeQR } from "./decode-qr";
import { DecodeHintType } from "./result-types";
import { tryDecode } from "./try-decode-adapter";
import { tryGlobalBinarizerStrategies } from "./try-global-binarizer-strategies";
import type { DecodeResult } from "../../../modules/qr-decoder/types";

/**
 * Decode QR code with aggressive fallback strategies
 * This is the main entry point for QR decoding
 */
export function decodeQR(
  imageData: ImageData,
  options: { inversionAttempts?: "dontInvert" | "onlyInvert" | "attemptBoth" } = {},
): DecodeResult | null {
  const { inversionAttempts = "attemptBoth" } = options;

  // Strategy 1: Normal with TRY_HARDER (always enabled)
  const tryHarderHints = new Map<DecodeHintType, unknown>();
  tryHarderHints.set(DecodeHintType.TRY_HARDER, true);

  if (inversionAttempts !== "onlyInvert") {
    qrDecoderLog.trace("strategy: Trying Normal + TRY_HARDER");
    const result = tryDecode(imageData, false, tryHarderHints);
    if (result) return result;
  }

  // Strategy 2: Inverted with TRY_HARDER
  if (inversionAttempts !== "dontInvert") {
    qrDecoderLog.trace("strategy: Trying Inverted + TRY_HARDER");
    const result = tryDecode(imageData, true, tryHarderHints);
    if (result) return result;
  }

  // Strategy 3: Try with PURE_BARCODE hint (assumes clean image)
  const pureHints = new Map<DecodeHintType, unknown>();
  pureHints.set(DecodeHintType.TRY_HARDER, true);
  pureHints.set(DecodeHintType.PURE_BARCODE, true);

  if (inversionAttempts !== "onlyInvert") {
    qrDecoderLog.trace("strategy: Trying Normal + TRY_HARDER + PURE_BARCODE");
    const result = tryDecode(imageData, false, pureHints);
    if (result) return result;
  }

  // Strategy 4: Try with GlobalHistogramBinarizer instead of HybridBinarizer
  const globalResult = tryGlobalBinarizerStrategies(imageData, inversionAttempts, tryHarderHints);
  if (globalResult) return globalResult;

  // Strategy 5: Fallback to our custom decoder (uses different finder pattern detection)
  qrDecoderLog.trace("strategy: Trying Custom decoder fallback");
  const customResult = customDecodeQR(imageData, options);
  if (customResult?.success) {
    qrDecoderLog.trace("strategy: SUCCESS - Custom decoder worked");
    return customResult;
  }

  qrDecoderLog.trace("strategy: All strategies exhausted - no QR code detected");
  return null;
}
