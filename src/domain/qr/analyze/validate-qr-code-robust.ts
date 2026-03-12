import type { ValidationResult } from './scanner.types';
import { validateQRCode } from './validate-qr-code';

/**
 * Validate QR code with multiple scan attempts
 */
export function validateQRCodeRobust(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  expectedContent?: string,
  attempts: number = 3
): ValidationResult {
  for (let i = 0; i < attempts; i++) {
    const result = validateQRCode(canvas, expectedContent);
    if (result.valid) return result;
  }

  return {
    valid: false,
    error: 'Failed to validate after multiple attempts',
    confidence: 'low',
  };
}
