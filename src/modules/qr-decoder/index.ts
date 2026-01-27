/**
 * QR Decoder - Consolidated decoder implementation
 * High-quality QR code decoding with multiple fallback strategies
 */

// Main decoder function
export { decodeQR } from './decoder-adapter';

// Canvas decoder
export { decodeFromCanvas } from './decode-canvas';

// Types
export type { DecodeResult, FinderPatternResult, Point } from './types';
export { ECC_LEVEL_MAP } from './types';

// Legacy exports for backwards compatibility (if needed)
export { decodeQR as decodeQRLegacy } from './decode-qr';
