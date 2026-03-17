/**
 * Professional Logging System
 *
 * Canonical logging API for the entire codebase (web + Capacitor).
 * Uses loglevel as the underlying implementation with:
 * - Runtime-configurable log levels
 * - Uppercase scope prefixes for easy filtering
 * - Sentry integration for errors/warnings
 * - Sensitive data redaction
 * - Log buffer capture for debugging (e.g., failed QR detections)
 *
 * LOG LEVELS (in order of verbosity):
 *   trace  - Very high-volume diagnostics (decoder/encoder inner loops)
 *   debug  - Development diagnostics (disabled in production by default)
 *   info   - Lifecycle milestones (suppressed in production by default)
 *   warn   - Unexpected but recoverable (recorded as Sentry breadcrumb)
 *   error  - Failures (sent to Sentry as event)
 *
 * DEFAULTS:
 *   Development: 'debug' (maximum visibility)
 *   Production:  'error' (minimum noise - only failures)
 *
 * Toggle via remote diagnostics:
 *   window.anqrDiag.enable(30)  - Enable debug logging for 30 minutes
 *   window.anqrDiag.disable()  - Revert to production default
 *
 * Usage:
 *   import { createLogger } from '@/lib/logger';
 *
 *   // Use a scoped logger (recommended)
 *   const log = createLogger('OVERLAY');
 *   log.trace('High-volume diagnostic', { pixels: 1000 });
 *   log.debug('Processing image', { width: 100, height: 100 });
 *   log.info('Overlay applied successfully');
 *   log.warn('Low contrast detected', { ratio: 2.1 });
 *   log.error('Failed to load image', { error, url });
 *
 *   // For debugging failed operations, capture logs to a buffer:
 *   import { enableLogBuffer, flushLogBuffer, disableLogBuffer, getBufferSize } from '@/lib/logger';
 *   enableLogBuffer();
 *   // ... do something that might fail ...
 *   const debugLog = flushLogBuffer(); // Get captured logs (includes ISO timestamps)
 *   disableLogBuffer();
 *
 * LOG BUFFER LIMITS:
 *   - Maximum buffer size: 1000 entries (oldest entries are dropped when exceeded)
 *   - Buffer entries include ISO 8601 timestamps for debugging
 *   - Use getBufferSize() to check current buffer size
 *
 * STANDARD SCOPE PREFIXES (see SCOPE_PREFIXES export for complete list):
 *
 *   App Shell:
 *     APP, MAIN, ERROR, HEADER, DIAG
 *
 *   UI Components:
 *     ANALYZE, OVERLAY, PAYLOAD, HELP, GALLERY, SIDEBAR, PREVIEW, WELCOME
 *
 *   QR Generation Pipeline:
 *     QRGEN, GENERATE, DITHER, ENCODER, SPEC
 *
 *   QR Analysis Pipeline:
 *     DECODER, ANALYZER, SCANNER, SAFETY
 *
 *   Export & Sharing:
 *     EXPORT, SHARE, CLIPBOARD, DOWNLOAD
 *
 *   Media & Effects:
 *     ANIMATION, WATERMARK, TELEMETRY
 *
 *   Data & Platform:
 *     I18N, STATIC, PLATFORM, ADMOB, STORAGE
 *
 *   Advanced Features:
 *     QART, CORE, COLOR, GRADIENT
 */

export {
  clearStructuredLogs,
  disableLogBuffer,
  enableLogBuffer,
  filterLogs,
  filterLogsByLevel,
  filterLogsByScopes,
  flushLogBuffer,
  getBufferSize,
  getStructuredLogCount,
  getStructuredLogs,
  saveFilteredLogs,
  saveLogs,
} from "./logger-buffer-api";
export { SCOPE_PREFIXES } from "./logger-scope-prefixes";
export type { ScopePrefix } from "./logger-scope-prefixes";
export { createLogger } from "./create-logger";
export { getLogLevel } from "./get-log-level";
export { resetLogLevel } from "./reset-log-level";
export { setLogLevel } from "./set-log-level";
export type { LogContext, Logger, LogLevel, StructuredLogEntry } from "./logger-types";

// ============================================================================
// Standard Scope Prefixes - canonical list for all modules
// ============================================================================

/**
 * Standard logging scope prefixes organized by category.
 * Use these when creating loggers to ensure consistency across the codebase.
 *
 * When adding logging to a new module, find the appropriate category and
 * use the corresponding prefix. If a new prefix is needed, add it here first.
 */
/**
 * Create a scoped logger with uppercase prefix.
 *
 * @param scope - Logger scope name (will be uppercased), e.g., 'OVERLAY', 'ANALYZE'
 * @returns Logger instance with debug/info/warn/error methods
 *
 * @example
 * const log = createLogger('OVERLAY');
 * log.debug('Processing started', { imageSize: 1024 });
 */
/**
 * Set the global log level for all loggers.
 * Used by remote diagnostics to enable verbose logging.
 */
