import type { ValidationResult } from './scanner.types';
import { scanCanvas } from './scan-canvas';

/**
 * Validate QR code by scanning and comparing to expected content
 */
export function validateQRCode(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  expectedContent?: string
): ValidationResult {
  const result = scanCanvas(canvas);

  if (!result.data) {
    return {
      valid: false,
      error: 'No QR code detected',
      confidence: 'low',
    };
  }

  if (expectedContent && result.data !== expectedContent) {
    return {
      valid: false,
      data: result.data,
      error: 'Content does not match expected',
      confidence: 'medium',
    };
  }

  return {
    valid: true,
    data: result.data,
    confidence: 'high',
  };
}
