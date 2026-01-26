/**
 * QR Decoder - Uses the proven ZXing library implementation
 * Our custom RS decoder had issues, so we switched to ZXing's battle-tested decoder
 */

// Main decoder function - now using ZXing library
export { decodeQRWithZXing as decodeQR } from './zxing-adapter';

// Canvas decoder
export { decodeFromCanvas } from './decode-canvas';

// Types
export type { DecodeResult, FinderPatternResult, Point } from './types';
export { ECC_LEVEL_MAP } from './types';

// Legacy exports for backwards compatibility (if needed)
export { decodeQR as decodeQRLegacy } from './decode-qr';
