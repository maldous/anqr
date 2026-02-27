/**
 * QR Validation Web Worker
 * Runs QR code decoding off the main thread to keep Android WebView responsive.
 *
 * Protocol:
 *   Main → Worker: { id, imageData, expectedContent?, attempts }
 *   Worker → Main: { id, result: ValidationResult }
 */

import { decodeQR } from '../qr-decoder';

interface ValidateRequest {
  id: number;
  imageData: ImageData;
  expectedContent?: string;
  attempts: number;
}

interface ValidationResult {
  valid: boolean;
  data?: string;
  error?: string;
  confidence: 'high' | 'medium' | 'low';
}

self.onmessage = (e: MessageEvent<ValidateRequest>) => {
  const { id, imageData, expectedContent, attempts } = e.data;
  const result = validate(imageData, expectedContent, attempts);
  self.postMessage({ id, result });
};

function validate(
  imageData: ImageData,
  expectedContent: string | undefined,
  attempts: number
): ValidationResult {
  for (let i = 0; i < attempts; i++) {
    try {
      const decoded = decodeQR(imageData, { inversionAttempts: 'attemptBoth' });

      if (decoded?.success && decoded.data) {
        if (expectedContent && decoded.data !== expectedContent) {
          return {
            valid: false,
            data: decoded.data,
            error: 'Content does not match expected',
            confidence: 'medium',
          };
        }
        return { valid: true, data: decoded.data, confidence: 'high' };
      }
    } catch {
      // Decode attempt failed — retry
    }
  }

  return {
    valid: false,
    error: 'Failed to validate after multiple attempts',
    confidence: 'low',
  };
}
