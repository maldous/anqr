/**
 * QR Analyzer Logger Utility
 * Provides consistent logging across QR decoder and analyzer modules
 *
 * Supports buffered logging: when enabled, logs are captured to a buffer
 * that can be retrieved for debug output (e.g., when QR detection fails).
 */

// Debug logging to console - enable for troubleshooting
const DEBUG_CONSOLE = true;

export type LogData = Record<string, unknown>;

export type Logger = (category: string, message: string, data?: LogData) => void;

// ============================================================================
// Log Buffer - captures logs for debug output when detection fails
// ============================================================================

let logBufferEnabled = false;
let logBuffer: string[] = [];

/**
 * Enable log buffering and clear any existing buffer
 */
export function enableLogBuffer(): void {
  logBufferEnabled = true;
  logBuffer = [];
}

/**
 * Disable log buffering
 */
export function disableLogBuffer(): void {
  logBufferEnabled = false;
}

/**
 * Get the captured log buffer as a single string and clear it
 */
export function flushLogBuffer(): string {
  const result = logBuffer.join('\n');
  logBuffer = [];
  return result;
}

// ============================================================================
// Logger Factory
// ============================================================================

/**
 * Create a logger with a specific module prefix
 * @param modulePrefix - The module name to use in log messages (e.g., 'QR-Decoder', 'QR-Analyzer')
 */
export function createLogger(modulePrefix: string): Logger {
  return function log(category: string, message: string, data?: LogData): void {
    const prefix = `[${modulePrefix}:${category}]`;

    // Format the log message
    let logLine: string;
    if (data) {
      // Format data compactly for buffer
      const dataStr = Object.entries(data)
        .map(([k, v]) => {
          if (typeof v === 'object' && v !== null) {
            return `${k}=${JSON.stringify(v)}`;
          }
          return `${k}=${v}`;
        })
        .join(', ');
      logLine = `${prefix} ${message} {${dataStr}}`;
    } else {
      logLine = `${prefix} ${message}`;
    }

    // Capture to buffer if enabled
    if (logBufferEnabled) {
      logBuffer.push(logLine);
    }

    // Also log to console if debug is enabled
    if (DEBUG_CONSOLE) {
      if (data) {
        console.log(prefix, message, data);
      } else {
        console.log(prefix, message);
      }
    }
  };
}

/**
 * Pre-configured logger for QR Decoder module
 */
export const qrDecoderLog = createLogger('QR-Decoder');

/**
 * Pre-configured logger for QR Analyzer module
 */
export const qrAnalyzerLog = createLogger('QR-Analyzer');
