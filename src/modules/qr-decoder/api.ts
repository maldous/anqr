/**
 * QR Decoder Module - Public API Manifest
 *
 * This file documents all public exports from the qr-decoder module.
 * Used by CI to check for API drift against index.ts exports.
 */

// Main decoder
export const DECODER_API = ['decodeQR', 'decodeFromCanvas'] as const;

// Constants
export const CONSTANTS = ['ECC_LEVEL_MAP'] as const;

// Types
export const TYPES = ['DecodeResult', 'Point'] as const;

// All public exports
export const PUBLIC_API = [...DECODER_API, ...CONSTANTS] as const;
