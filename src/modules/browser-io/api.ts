/**
 * Browser I/O Module - Public API Manifest
 *
 * This file documents all public exports from the browser-io module.
 * Used by CI to check for API drift against index.ts exports.
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('BROWSER_IO');

// Canvas utilities
export const CANVAS_API = ['canvasToBlob', 'canvasToDataUrl'] as const;

// Download utilities
export const DOWNLOAD_API = ['downloadBlob', 'downloadUrl'] as const;

// Native save utilities
export const NATIVE_API = ['saveFileNative'] as const;

// All public exports
export const PUBLIC_API = [...CANVAS_API, ...DOWNLOAD_API, ...NATIVE_API] as const;
