/**
 * QR Validation Web Worker
 * Runs QR code decoding off the main thread to keep Android WebView responsive.
 *
 * Protocol:
 *   Main → Worker: { id, width, height, pixels, expectedContent?, attempts }
 *   Worker → Main: { id, result: ValidationResult }
 */

import { decodeQR } from "@/domain/qr/decode";
import type { ValidateRequest } from "./validate-request";
import type { ValidationResult } from "./validation-worker-result";

globalThis.onmessage = (e: MessageEvent<ValidateRequest>) => {
  const { id, width, height, pixels, expectedContent, attempts } = e.data;
  const pixelView = new Uint8ClampedArray(
    pixels.buffer as ArrayBuffer,
    pixels.byteOffset,
    pixels.byteLength,
  );
  const imageData = new ImageData(pixelView, width, height);
  const result = validate(imageData, expectedContent, attempts);
  globalThis.postMessage({ id, result });
};

const validate = (
  imageData: ImageData,
  expectedContent: string | undefined,
  attempts: number,
): ValidationResult => {
  for (let i = 0; i < attempts; i++) {
    try {
      const decoded = decodeQR(imageData, { inversionAttempts: "attemptBoth" });

      if (decoded?.success && decoded.data) {
        if (expectedContent && decoded.data !== expectedContent) {
          return {
            valid: false,
            data: decoded.data,
            error: "Content does not match expected",
            confidence: "medium",
          };
        }
        return { valid: true, data: decoded.data, confidence: "high" };
      }
    } catch {
      // Decode attempt failed — retry
    }
  }

  return {
    valid: false,
    error: "Failed to validate after multiple attempts",
    confidence: "low",
  };
};
