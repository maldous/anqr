/**
 * Browser I/O Module
 * Canvas to Blob conversion and download utilities
 *
 * This module provides:
 * - Canvas to Blob conversion
 * - Download from URL/Blob
 * - Native file saving (Android/iOS via Capacitor)
 *
 * Rules:
 * - Browser-only APIs (canvas, download, Capacitor)
 * - No dependencies on other modules except platform
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('BROWSER_IO');

// Canvas utilities
export { canvasToBlob, canvasToDataUrl } from './canvas-utils';

// Download utilities
export { downloadBlob, downloadUrl } from './download';

// Native save utilities
export { saveFileNative } from './native-save';
