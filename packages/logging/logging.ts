// Implement structured logging with redaction using OWASP logging rules as baseline
// Add release/environment/runtime metadata to all log entries

// Re-export from observability/logging (canonical implementation)
export type {
  Logger,
  LogLevel,
  LogContext,
  StructuredLogEntry,
} from "../observability/logging/src/logger-types";
export type { SentryLike } from "../observability/logging/src/sentry-like.types";
export { createLogger } from "../observability/logging/src/create-logger";
export { getLogLevel, setLogLevel, resetLogLevel } from "../observability/logging/src/logger";
export {
  enableLogBuffer,
  disableLogBuffer,
  flushLogBuffer,
  getBufferSize,
  clearStructuredLogs,
  getStructuredLogs,
  getStructuredLogCount,
} from "../observability/logging/src/logger";
