import { HybridBinarizer } from "./binarizer";
import { createLuminanceSource } from "./create-luminance-source";
import { ChecksumException, FormatException, NotFoundException } from "./exceptions";
import { extractDecodeResult } from "./extract-decode-result";
import { invertImageData } from "./invert-image-data";
import { BinaryBitmap } from "./luminance";
import { Reader } from "./reader";
import { DecodeHintType } from "./result-types";
import type { DecodeResult } from "@/modules/qr-decoder/types";
import { qrDecoderLog } from "./decoder-log";

export function tryDecode(
  imageData: ImageData,
  invert: boolean,
  hints?: Map<DecodeHintType, unknown>,
): DecodeResult | null {
  const hintDesc = hints
    ? Array.from(hints.keys())
        .map((k) => DecodeHintType[k])
        .join("+")
    : "none";
  qrDecoderLog.trace("decoder: Starting decode attempt", {
    width: imageData.width,
    height: imageData.height,
    invert,
    hints: hintDesc,
  });
  try {
    const source = createLuminanceSource(invert ? invertImageData(imageData) : imageData);
    const bitmap = new BinaryBitmap(new HybridBinarizer(source));
    const result = new Reader().decode(bitmap, hints);
    qrDecoderLog.trace("decoder: Reader.decode() succeeded", { hints: hintDesc });
    return extractDecodeResult(result, imageData);
  } catch (err) {
    if (err instanceof NotFoundException) {
      qrDecoderLog.trace("decoder: DECODE FAILED - NotFoundException", {
        message: err.message || "No QR code found in image",
        invert,
      });
    } else if (err instanceof FormatException) {
      qrDecoderLog.trace("decoder: DECODE FAILED - FormatException", {
        message: err.message || "QR code format error",
        invert,
      });
    } else if (err instanceof ChecksumException) {
      qrDecoderLog.trace("decoder: DECODE FAILED - ChecksumException", {
        message: err.message || "QR code checksum error",
        invert,
      });
    } else {
      qrDecoderLog.trace("decoder: DECODE FAILED - Unknown exception", {
        errorType: err?.constructor?.name || "Unknown",
        message: err instanceof Error ? err.message : String(err),
        invert,
      });
    }
    return null;
  }
}
