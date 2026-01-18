/**
 * QR Decoder Logger
 * Internal logging helper
 */

// Debug logging - can be disabled in production
const DEBUG = false;

export function log(category: string, message: string, data?: Record<string, unknown>): void {
  if (!DEBUG) return;
  
  const prefix = `[QR-Decoder:${category}]`;
  if (data) {
    // biome-ignore lint/suspicious/noConsole: Debug logging for QR decoder
    console.log(prefix, message, data);
  } else {
    // biome-ignore lint/suspicious/noConsole: Debug logging for QR decoder
    console.log(prefix, message);
  }
}
