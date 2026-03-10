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

import loglevel from 'loglevel';
import prefix from 'loglevel-plugin-prefix';

// Sentry is only functional in the main browser thread (not in Web Workers).
// Workers lack document/DOM; guard all Sentry calls behind this flag.
const _isMainThread = document !== undefined;

// Lazy-loaded Sentry reference — null in Worker context to avoid importing
// @sentry/react (which depends on DOM/React internals) into Worker bundles.
// biome-ignore lint/suspicious/noExplicitAny: Sentry module shape varies across versions
let _Sentry: any = null;
if (_isMainThread) {
  void import('@sentry/react').then((m) => {
    _Sentry = m;
  });
}

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
export const SCOPE_PREFIXES = {
  // -------------------------------------------------------------------------
  // App Shell - Core application infrastructure
  // -------------------------------------------------------------------------
  /** Main application root (src/main.tsx) */
  MAIN: 'MAIN',
  /** App component (src/App.tsx) */
  APP: 'APP',
  /** Error boundary (src/components/ErrorBoundary.tsx) */
  ERROR: 'ERROR',
  /** Header component (src/components/Header.tsx) */
  HEADER: 'HEADER',
  /** Remote diagnostics controller (src/lib/logger-remote.ts) */
  DIAG: 'DIAG',

  // -------------------------------------------------------------------------
  // UI Components - User interface sections and controls
  // -------------------------------------------------------------------------
  /** Analyze component for QR scanning (src/components/Analyze.tsx) */
  ANALYZE: 'ANALYZE',
  /** Overlay section UI (src/components/sections/OverlaySection.tsx) */
  OVERLAY: 'OVERLAY',
  /** Payload section UI (src/components/sections/PayloadSection.tsx) */
  PAYLOAD: 'PAYLOAD',
  /** Help link component (src/components/ui/help-link.tsx) */
  HELP: 'HELP',
  /** Gallery component (src/components/Gallery.tsx) */
  GALLERY: 'GALLERY',
  /** Sidebar component (src/components/Sidebar.tsx) */
  SIDEBAR: 'SIDEBAR',
  /** Preview component (src/components/Preview.tsx) */
  PREVIEW: 'PREVIEW',
  /** Welcome modal (src/components/WelcomeModal.tsx) */
  WELCOME: 'WELCOME',

  // -------------------------------------------------------------------------
  // QR Generation Pipeline - QR code creation and rendering
  // -------------------------------------------------------------------------
  /** Main QR generation hook (src/hooks/useQRGenerator.ts) */
  QRGEN: 'QRGEN',
  /** QR generator class (src/modules/qr-generator/) */
  GENERATE: 'GENERATE',
  /** Dithering algorithms (src/modules/qr-generator/pixel-matrix-dithered.ts) */
  DITHER: 'DITHER',
  /** QR encoding (src/modules/qr-encoder/) */
  ENCODER: 'ENCODER',
  /** QR specification utilities (src/modules/qr-spec/) */
  SPEC: 'SPEC',

  // -------------------------------------------------------------------------
  // QR Analysis Pipeline - QR code decoding and validation
  // -------------------------------------------------------------------------
  /** QR decoder (src/modules/qr-decoder/) */
  DECODER: 'DECODER',
  /** QR analyzer (src/modules/qr-analyzer/) */
  ANALYZER: 'ANALYZER',
  /** QR scanner/validator (src/modules/qr-analyzer/scanner.ts) */
  SCANNER: 'SCANNER',
  /** Safety analysis (src/modules/qr-analyzer/safety.ts) */
  SAFETY: 'SAFETY',

  // -------------------------------------------------------------------------
  // Export & Sharing - File export and sharing functionality
  // -------------------------------------------------------------------------
  /** Image/GIF/SVG export (src/modules/exporter/) */
  EXPORT: 'EXPORT',
  /** Share links and URL encoding (src/modules/share-links/) */
  SHARE: 'SHARE',
  /** Clipboard operations (src/modules/browser-clipboard/) */
  CLIPBOARD: 'CLIPBOARD',
  /** Browser I/O / download operations (src/modules/browser-io/) */
  DOWNLOAD: 'DOWNLOAD',

  // -------------------------------------------------------------------------
  // Media & Effects - Animation and visual effects
  // -------------------------------------------------------------------------
  /** Animation parsing/playback (src/modules/animation/) */
  ANIMATION: 'ANIMATION',
  /** Watermark application (src/modules/overlay/watermark.ts) */
  WATERMARK: 'WATERMARK',
  /** Telemetry and stats (src/modules/qr-analyzer/telemetry-*.ts) */
  TELEMETRY: 'TELEMETRY',

  // -------------------------------------------------------------------------
  // Data & Platform - Data generation and platform services
  // -------------------------------------------------------------------------

  /** Internationalization (src/i18n/index.ts) */
  I18N: 'I18N',
  /** Static content i18n (src/i18n/static/index.ts) */
  STATIC: 'STATIC',
  /** Platform detection (src/modules/platform/) */
  PLATFORM: 'PLATFORM',
  /** AdMob service (src/modules/platform/admob.ts) */
  ADMOB: 'ADMOB',
  /** Media store writer (src/modules/platform/media-store.ts) */
  STORAGE: 'STORAGE',
  /** Zaraz analytics tracking (src/lib/zaraz.ts) */
  ZARAZ: 'ZARAZ',

  // -------------------------------------------------------------------------
  // Advanced Features - Specialized functionality
  // -------------------------------------------------------------------------
  /** QArt generation (src/modules/qr-art/) */
  QART: 'QART',
  /** Core utilities (src/modules/core/) */
  CORE: 'CORE',
  /** Color utilities (src/modules/core/color.ts) */
  COLOR: 'COLOR',
  /** Gradient utilities (src/modules/core/gradient.ts) */
  GRADIENT: 'GRADIENT',
} as const;

/** Type for valid scope prefix names */
export type ScopePrefix = (typeof SCOPE_PREFIXES)[keyof typeof SCOPE_PREFIXES];

// ============================================================================
// Log Buffer Configuration
// ============================================================================

/** Maximum number of log entries to keep in buffer (oldest are dropped when exceeded) */
const MAX_BUFFER_SIZE = 2000;

/** Maximum number of structured log entries to keep */
const MAX_STRUCTURED_BUFFER_SIZE = 5000;

/** Maximum depth for context object serialization (prevents infinite recursion) */
const MAX_CONTEXT_DEPTH = 10;

// ============================================================================
// Log Buffer - captures logs for debug output when operations fail
// ============================================================================

let logBufferEnabled = false;
let logBuffer: string[] = [];

// ============================================================================
// Structured Log Buffer - selectively captured based on level/diagnostics
// ============================================================================

/** Structured log entry with full context objects preserved */
export interface StructuredLogEntry {
  timestamp: string;
  scope: string;
  level: string;
  message: string;
  context?: unknown;
}

/** Structured buffer for saveLogs() - captures last N selected entries */
let structuredLogBuffer: StructuredLogEntry[] = [];

/**
 * Enable log buffering and clear any existing buffer.
 * When enabled, all log messages are captured to a buffer.
 */
export function enableLogBuffer(): void {
  logBufferEnabled = true;
  logBuffer = [];
}

/**
 * Disable log buffering.
 */
export function disableLogBuffer(): void {
  logBufferEnabled = false;
}

/**
 * Get the captured log buffer as a single string and clear it.
 * @returns All captured log messages joined by newlines
 */
export function flushLogBuffer(): string {
  const result = logBuffer.join('\n');
  logBuffer = [];
  return result;
}

/**
 * Get the current number of entries in the log buffer.
 * @returns Number of buffered log entries
 */
export function getBufferSize(): number {
  return logBuffer.length;
}

// ============================================================================
// Structured Log Buffer Functions
// ============================================================================

/**
 * Get all structured log entries.
 * Returns a copy of the buffer with full context objects preserved.
 */
export function getStructuredLogs(): StructuredLogEntry[] {
  return [...structuredLogBuffer];
}

/**
 * Clear the structured log buffer.
 */
export function clearStructuredLogs(): void {
  structuredLogBuffer = [];
}

/**
 * Get the number of entries in the structured log buffer.
 */
export function getStructuredLogCount(): number {
  return structuredLogBuffer.length;
}

/**
 * Filter logs by scope prefix (e.g., 'QART', 'GENERATE')
 *
 * @param scope - Scope prefix to filter by (case-insensitive)
 * @returns Filtered log entries
 */
export function filterLogs(scope: string): StructuredLogEntry[] {
  const upperScope = scope.toUpperCase();
  return structuredLogBuffer.filter((entry) => entry.scope.toUpperCase() === upperScope);
}

/**
 * Filter logs by multiple scope prefixes
 *
 * @param scopes - Array of scope prefixes to include
 * @returns Filtered log entries
 */
export function filterLogsByScopes(scopes: string[]): StructuredLogEntry[] {
  const upperScopes = new Set(scopes.map((s) => s.toUpperCase()));
  return structuredLogBuffer.filter((entry) => upperScopes.has(entry.scope.toUpperCase()));
}

/**
 * Filter logs by level (e.g., 'error', 'warn')
 *
 * @param levels - Array of levels to include
 * @returns Filtered log entries
 */
export function filterLogsByLevel(levels: string[]): StructuredLogEntry[] {
  const lowerLevels = new Set(levels.map((l) => l.toLowerCase()));
  return structuredLogBuffer.filter((entry) => lowerLevels.has(entry.level.toLowerCase()));
}

/**
 * Save all structured logs to a JSON file (browser download).
 * Objects are fully expanded in the JSON output.
 *
 * @param filename - Optional filename (default: anqr-logs-{timestamp}.json)
 */
export function saveLogs(filename?: string): void {
  if (!_isMainThread) return;

  const logs = getStructuredLogs();

  if (logs.length === 0) {
    console.log('No logs to save. Buffer is empty.');
    return;
  }

  const timestamp = new Date().toISOString().replaceAll(/[:.]/g, '-');
  const name = filename || `anqr-logs-${timestamp}.json`;

  const json = JSON.stringify(logs, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  console.log(`Saved ${logs.length} log entries to ${name}`);
}

/**
 * Save filtered logs to a JSON file (browser download).
 *
 * @param scope - Scope prefix to filter by (e.g., 'QART')
 * @param filename - Optional filename
 */
export function saveFilteredLogs(scope: string, filename?: string): void {
  if (!_isMainThread) return;

  const logs = filterLogs(scope);

  if (logs.length === 0) {
    console.log(
      `No logs found for scope '${scope}'. Buffer has ${structuredLogBuffer.length} total entries.`
    );
    return;
  }

  const timestamp = new Date().toISOString().replaceAll(/[:.]/g, '-');
  const name = filename || `anqr-${scope.toLowerCase()}-logs-${timestamp}.json`;

  const json = JSON.stringify(logs, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  console.log(
    `Saved ${logs.length} '${scope}' log entries to ${name} (${structuredLogBuffer.length} total in buffer)`
  );
}

/**
 * Safely serialize an object for logging, handling non-cloneable objects.
 * Uses JSON serialization as fallback for structuredClone failures.
 */
function safeSerializeContext(context: unknown): unknown {
  if (context === null || context === undefined) {
    return context;
  }

  // First try structuredClone (fastest, preserves most types)
  try {
    return structuredClone(context);
  } catch {
    // structuredClone failed, try JSON round-trip
  }

  // Try JSON serialization (handles most plain objects)
  try {
    const jsonStr = JSON.stringify(context, (_key, value) => {
      // Handle special cases
      if (value instanceof Error) {
        return {
          __type: 'Error',
          name: value.name,
          message: value.message,
          stack: value.stack,
        };
      }
      if (value instanceof Set) {
        return { __type: 'Set', values: Array.from(value) };
      }
      if (value instanceof Map) {
        return { __type: 'Map', entries: Array.from(value.entries()) };
      }
      if (typeof value === 'function') {
        return '[Function]';
      }
      if (value instanceof HTMLElement) {
        return `[HTMLElement: ${value.tagName}]`;
      }
      if (value instanceof Node) {
        return `[Node: ${value.nodeName}]`;
      }
      // Handle typed arrays
      if (ArrayBuffer.isView(value) && !(value instanceof DataView)) {
        return { __type: value.constructor.name, values: Array.from(value as Uint8Array) };
      }
      return value;
    });
    return JSON.parse(jsonStr);
  } catch {
    // JSON serialization also failed
  }

  // Last resort: try to extract what we can
  if (typeof context === 'object') {
    const result: Record<string, unknown> = {};
    try {
      for (const [key, value] of Object.entries(context as Record<string, unknown>)) {
        try {
          if (value === null || value === undefined) {
            result[key] = value;
          } else if (typeof value === 'function') {
            result[key] = '[Function]';
          } else if (typeof value === 'object') {
            // Try to serialize nested object
            result[key] = structuredClone(value);
          } else {
            result[key] = value;
          }
        } catch {
          result[key] = `[Unserializable: ${typeof value}]`;
        }
      }
      return result;
    } catch {
      return '[Unserializable object]';
    }
  }

  return '[Unserializable]';
}

interface BufferCaptureOptions {
  captureStructured: boolean;
  captureString: boolean;
}

/**
 * Capture a log line to one or both in-memory buffers.
 * Serialization/redaction should happen before this function.
 */
function captureToBuffer(
  scope: string,
  level: string,
  message: string,
  context: unknown,
  options: BufferCaptureOptions
): void {
  if (!(options.captureStructured || options.captureString)) return;

  const timestamp = new Date().toISOString();

  if (options.captureStructured) {
    if (structuredLogBuffer.length >= MAX_STRUCTURED_BUFFER_SIZE) {
      structuredLogBuffer.shift();
    }

    const serializedContext = context ? safeSerializeContext(context) : undefined;
    structuredLogBuffer.push({
      timestamp,
      scope,
      level,
      message,
      context: serializedContext,
    });
  }

  if (!options.captureString) return;

  const prefix = `${timestamp} [${scope}:${level}]`;
  let logLine: string;

  if (context && typeof context === 'object') {
    try {
      const dataStr = Object.entries(context as Record<string, unknown>)
        .map(([k, v]) => {
          if (typeof v === 'object' && v !== null) {
            return `${k}=${JSON.stringify(v)}`;
          }
          return `${k}=${v}`;
        })
        .join(', ');
      logLine = `${prefix} ${message} {${dataStr}}`;
    } catch {
      logLine = `${prefix} ${message} {[serialization failed]}`;
    }
  } else {
    logLine = `${prefix} ${message}`;
  }

  // Enforce buffer size limit - drop oldest entries when limit exceeded
  if (logBuffer.length >= MAX_BUFFER_SIZE) {
    logBuffer.shift();
  }

  logBuffer.push(logLine);
}

// ============================================================================
// Configuration
// ============================================================================

/** Keys that should be redacted from log context (all lowercase for case-insensitive matching) */
const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'secret',
  'apikey',
  'api_key',
  'authorization',
  'auth',
  'credential',
  'sessionid',
  'session_id',
  'accesstoken',
  'access_token',
  'refreshtoken',
  'refresh_token',
  'privatekey',
  'private_key',
]);

/** Replacement for redacted values */
const REDACTED = '[REDACTED]';

// ============================================================================
// Setup loglevel with prefix plugin
// ============================================================================

// Apply prefix plugin
prefix.reg(loglevel);

// Configure prefix format: [SCOPE] message
prefix.apply(loglevel, {
  format(_level, name) {
    return `[${name}]`;
  },
});

// Set default level based on environment
// Development: show all logs (debug and above) - maximum visibility for debugging
// Production: show only errors - minimum noise, failures only (toggle via anqrDiag)
// Note: Handle Node.js environment where import.meta.env may not exist
const envLevelRaw = process === undefined ? undefined : process.env.ANQR_LOG_LEVEL?.toLowerCase();
const envLevel = (() => {
  switch (envLevelRaw) {
    case 'trace':
    case 'debug':
    case 'info':
    case 'warn':
    case 'error':
    case 'silent':
      return envLevelRaw;
    default:
      return undefined;
  }
})();
const isDev =
  typeof import.meta?.env?.DEV === 'undefined'
    ? process.env.NODE_ENV !== 'production'
    : import.meta.env.DEV;
const defaultLevel = envLevel ?? (isDev ? 'debug' : 'error');
loglevel.setLevel(defaultLevel);
type RuntimeLogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent';

const LOG_LEVEL_INDEX: Record<RuntimeLogLevel, number> = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  silent: 5,
};

const captureMinLevelRaw =
  process === undefined ? undefined : process.env.ANQR_LOG_CAPTURE_MIN_LEVEL?.toLowerCase();
const captureWhenConsoleEnabled =
  process !== undefined && process.env.ANQR_LOG_CAPTURE_CONSOLE === '1';
const captureMinLevel = (() => {
  switch (captureMinLevelRaw) {
    case 'trace':
    case 'debug':
    case 'info':
    case 'warn':
    case 'error':
      return captureMinLevelRaw as RuntimeLogLevel;
    default:
      return 'warn' as RuntimeLogLevel;
  }
})();
const forceStructuredCaptureAll = process !== undefined && process.env.ANQR_LOG_CAPTURE_ALL === '1';

function isLevelEnabledForLogger(
  logger: loglevel.Logger,
  level: Exclude<RuntimeLogLevel, 'silent'>
): boolean {
  const maybeGetter = (logger as unknown as { getLevel?: () => number }).getLevel;
  const loggerLevel =
    typeof maybeGetter === 'function' ? maybeGetter.call(logger) : loglevel.getLevel();
  return LOG_LEVEL_INDEX[level] >= loggerLevel;
}

function shouldCaptureStructured(
  level: Exclude<RuntimeLogLevel, 'silent'>,
  isConsoleEnabled: boolean
): boolean {
  if (forceStructuredCaptureAll) return true;
  if (captureWhenConsoleEnabled && isConsoleEnabled) return true;
  return LOG_LEVEL_INDEX[level] >= LOG_LEVEL_INDEX[captureMinLevel];
}

// ============================================================================
// Redaction utilities
// ============================================================================

/**
 * Deep clone and redact sensitive keys from an object
 */
function redactSensitive(obj: unknown, depth = 0): unknown {
  // Prevent infinite recursion
  if (depth > MAX_CONTEXT_DEPTH) return '[MAX_DEPTH]';

  if (obj === null || obj === undefined) return obj;

  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitive(item, depth + 1));
  }

  // Pass through special types unchanged — safeSerializeContext handles them later
  if (obj instanceof Error) return obj;
  if (obj instanceof Set || obj instanceof Map) return obj;
  if (Node !== undefined && obj instanceof Node) return obj;
  if (ArrayBuffer.isView(obj)) return obj;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      result[key] = REDACTED;
    } else {
      result[key] = redactSensitive(value, depth + 1);
    }
  }
  return result;
}

// ============================================================================
// Logger interface
// ============================================================================

export type LogContext = Record<string, unknown>;

export interface Logger {
  /**
   * TRACE: Very high-volume diagnostics for inner loops.
   * Use for: decoder pixel iterations, encoder bit operations, per-module rendering.
   * Visibility: Only when explicitly enabled via setLogLevel('trace').
   */
  trace(message: string, context?: LogContext): void;

  /**
   * DEBUG: Development diagnostics for function entry/exit and state changes.
   * Use for: processing steps, config values, intermediate results.
   * Visibility: Development only (default), or when diagnostics enabled in prod.
   */
  debug(message: string, context?: LogContext): void;

  /**
   * INFO: Lifecycle milestones and significant state transitions.
   * Use for: initialization complete, export finished, mode changes.
   * Visibility: Development only, suppressed in production.
   */
  info(message: string, context?: LogContext): void;

  /**
   * WARN: Unexpected but recoverable conditions.
   * Use for: fallback behavior triggered, deprecated usage, low contrast.
   * Visibility: Always visible. Recorded as Sentry breadcrumb.
   */
  warn(message: string, context?: LogContext): void;

  /**
   * ERROR: Failures that prevent expected functionality.
   * Use for: unrecoverable errors, failed operations, exceptions.
   * Visibility: Always visible. Sent to Sentry as error event.
   */
  error(message: string, context?: LogContext): void;
}

// ============================================================================
// Logger factory
// ============================================================================

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
export function createLogger(scope: string): Logger {
  const upperScope = scope.toUpperCase();
  const logger = loglevel.getLogger(upperScope);

  // Inherit level from root logger
  logger.setLevel(loglevel.getLevel());

  const emit = (
    level: Exclude<RuntimeLogLevel, 'silent'>,
    message: string,
    context?: LogContext
  ): LogContext | undefined => {
    const consoleEnabled = isLevelEnabledForLogger(logger, level);
    const captureStructured = shouldCaptureStructured(level, consoleEnabled);
    const captureString = logBufferEnabled;
    const needsSanitizedContext =
      !!context && (captureStructured || captureString || level === 'warn' || level === 'error');
    const safeContext = needsSanitizedContext
      ? (redactSensitive(context) as LogContext)
      : undefined;
    const contextForConsole = safeContext ?? context;

    if (captureStructured || captureString) {
      captureToBuffer(upperScope, level, message, safeContext ?? contextForConsole, {
        captureStructured,
        captureString,
      });
    }

    if (consoleEnabled) {
      const method = logger[level].bind(logger) as (msg: string, ctx?: LogContext) => void;
      if (contextForConsole) {
        method(message, contextForConsole);
      } else {
        method(message);
      }
    }

    return safeContext;
  };

  return {
    trace(message: string, context?: LogContext): void {
      emit('trace', message, context);
    },

    debug(message: string, context?: LogContext): void {
      emit('debug', message, context);
    },

    info(message: string, context?: LogContext): void {
      emit('info', message, context);
    },

    warn(message: string, context?: LogContext): void {
      const safeContext = emit('warn', message, context);

      // Record as Sentry breadcrumb (main thread only)
      if (_Sentry) {
        _Sentry.addBreadcrumb({
          category: upperScope,
          message,
          level: 'warning',
          data: safeContext as Record<string, unknown> | undefined,
        });
      }
    },

    error(message: string, context?: LogContext): void {
      const safeContext = emit('error', message, context);

      // Send to Sentry as event (main thread only)
      if (_Sentry) {
        _Sentry.withScope(
          (sentryScope: {
            setTag: (k: string, v: string) => void;
            setExtra: (k: string, v: unknown) => void;
            setExtras: (e: Record<string, unknown>) => void;
          }) => {
            sentryScope.setTag('logger.scope', upperScope);
            if (safeContext) {
              sentryScope.setExtras(safeContext);
            }

            const errorObj = context?.error;
            if (errorObj instanceof Error) {
              sentryScope.setExtra('originalMessage', message);
              _Sentry.captureException(errorObj);
            } else {
              _Sentry.captureMessage(`[${upperScope}] ${message}`, 'error');
            }
          }
        );
      }
    },
  };
}

// ============================================================================
// Level management (for remote diagnostics)
// ============================================================================

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent';

/**
 * Set the global log level for all loggers.
 * Used by remote diagnostics to enable verbose logging.
 */
export function setLogLevel(level: LogLevel): void {
  loglevel.setLevel(level);
  // Also update all child loggers
  for (const name of Object.keys(loglevel.getLoggers())) {
    loglevel.getLogger(name).setLevel(level);
  }
}

/**
 * Get the current log level.
 */
export function getLogLevel(): LogLevel {
  const levels: Record<number, LogLevel> = {
    0: 'trace',
    1: 'debug',
    2: 'info',
    3: 'warn',
    4: 'error',
    5: 'silent',
  };
  return levels[loglevel.getLevel()] || 'error';
}

/**
 * Reset log level to default.
 * Development: 'debug' (maximum visibility)
 * Production: 'error' (minimum noise)
 */
export function resetLogLevel(): void {
  setLogLevel(defaultLevel as LogLevel);
}
