/**
 * QR Analyzer Module
 * Extracts metadata from QR code images: version, ECC level, mask pattern, encoding mode, quiet zone
 * Uses custom finder pattern detection and payload decoding (no external dependencies)
 */

// ============================================
// LOGGING + INSTRUMENTATION
// ============================================

export type QRLogLevel = 'silent' | 'summary' | 'event' | 'debug';

export function _qrLogLevelRank(level: QRLogLevel): number {
  switch (level) {
    case 'silent': return 0;
    case 'summary': return 1;
    case 'event': return 2;
    case 'debug': return 3;
    default: return 1;
  }
}

export let QR_LOG_LEVEL: QRLogLevel =
  (typeof globalThis !== 'undefined' && (globalThis as any).__QR_ANALYZER_LOG_LEVEL)
    ? (globalThis as any).__QR_ANALYZER_LOG_LEVEL
    : 'summary';

export function setQRLogLevel(level: QRLogLevel): void {
  QR_LOG_LEVEL = level;
  if (typeof globalThis !== 'undefined') (globalThis as any).__QR_ANALYZER_LOG_LEVEL = level;
}

export type QRStage =
  | 'input_preprocess'
  | 'binarization_threshold'
  | 'finder_scan_merge'
  | 'timing_validation'
  | 'alignment_detection'
  | 'transform_sampling'
  | 'format_version_decode'
  | 'payload_decode';

export type QRFailureReason =
  | 'canvas_context_unavailable'
  | 'image_data_unavailable'
  | 'not_enough_finders'
  | 'unable_to_locate'
  | 'no_matrix_candidates'
  | 'no_successful_decode'
  | 'format_decode_failed'
  | 'version_decode_failed'
  | 'ecc_decode_failed'
  | 'payload_decode_failed'
  | 'unknown';

let DEBUG_LOG: string[] = [];

export function qrLogLazy(level: QRLogLevel, msgFactory: () => string): void {
  if (_qrLogLevelRank(QR_LOG_LEVEL) < _qrLogLevelRank(level)) return;
  const msg = msgFactory();
  const prefix = level === 'debug' ? '[QR-DEBUG]' : (level === 'event' ? '[QR-EVENT]' : '[QR]');
  const line = `${prefix} ${msg}`;
  if (level !== 'silent') console.log(line);
  if (level === 'debug') DEBUG_LOG.push(`[${Date.now() % 100000}] ${msg}`);
}

export function debugLog(msg: string): void {
  // Backwards-compatible hook. Default log level suppresses this.
  qrLogLazy('debug', () => msg);
}

export function getDebugLog(): string {
  return DEBUG_LOG.join('\n');
}

export function clearDebugLog(): void {
  DEBUG_LOG = [];
}

export function nowMs(): number {
  return Date.now();
}
