export interface StructuredLogEntry {
  timestamp: string;
  scope: string;
  level: string;
  message: string;
  context?: unknown;
}

export type LogContext = Record<string, unknown>;

export interface Logger {
  trace(message: string, context?: LogContext): void;
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
}

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent';
export type RuntimeLogLevel = LogLevel;

export interface BufferCaptureOptions {
  captureStructured: boolean;
  captureString: boolean;
}
