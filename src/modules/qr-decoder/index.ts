// Shim
/**
 * QR Decoder - Consolidated decoder implementation
 * High-quality QR code decoding with multiple fallback strategies
 */

import { createLogger } from "../../infra/logging/logger";

const _log = createLogger("DECODER");

// Canvas decoder
export { decodeFromCanvas } from "../../domain/qr/decode/decode-canvas";
// Legacy exports for backwards compatibility (if needed)
export { decodeQR as decodeQRLegacy } from "../../domain/qr/decode/decode-qr";
// Main decoder function
export { decodeQR } from "../../domain/qr/decode/decoder-adapter";
// Types
export type { DecodedSegmentInfo, DecodeResult, FinderPatternResult, Point } from "./types";
export { ECC_LEVEL_MAP } from "./types";
