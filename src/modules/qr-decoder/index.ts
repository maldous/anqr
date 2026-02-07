/**
 * QR Decoder - Consolidated decoder implementation
 * High-quality QR code decoding with multiple fallback strategies
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('DECODER');

// Canvas decoder
export { decodeFromCanvas } from './decode-canvas';
// Legacy exports for backwards compatibility (if needed)
export { decodeQR as decodeQRLegacy } from './decode-qr';
// Main decoder function
export { decodeQR } from './decoder-adapter';
// Types
export type { DecodedSegmentInfo, DecodeResult, FinderPatternResult, Point } from './types';
export { ECC_LEVEL_MAP } from './types';
