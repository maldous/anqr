/**
 * QR Analyzer Logger Utility
 * Provides consistent logging across QR decoder and analyzer modules
 */

// Debug logging - can be disabled in production
const DEBUG = true;

export type LogData = Record<string, unknown>;

export type Logger = (category: string, message: string, data?: LogData) => void;

/**
 * Create a logger with a specific module prefix
 * @param modulePrefix - The module name to use in log messages (e.g., 'QR-Decoder', 'QR-Analyzer')
 */
export function createLogger(modulePrefix: string): Logger {
  return function log(category: string, message: string, data?: LogData): void {
    if (!DEBUG) return;

    const prefix = `[${modulePrefix}:${category}]`;
    if (data) {
      console.log(prefix, message, data);
    } else {
      console.log(prefix, message);
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
