import { safeSerializeContext } from "./logger-context-serialization";
import { loggerState, MAX_BUFFER_SIZE, MAX_STRUCTURED_BUFFER_SIZE } from "./logger-state";
import type { BufferCaptureOptions } from "./logger-types";

export function captureToBuffer(
  scope: string,
  level: string,
  message: string,
  context: unknown,
  options: BufferCaptureOptions,
): void {
  if (!(options.captureStructured || options.captureString)) return;

  const timestamp = new Date().toISOString();

  if (options.captureStructured) {
    if (loggerState.structuredLogBuffer.length >= MAX_STRUCTURED_BUFFER_SIZE) {
      loggerState.structuredLogBuffer.shift();
    }

    loggerState.structuredLogBuffer.push({
      timestamp,
      scope,
      level,
      message,
      context: context ? safeSerializeContext(context) : undefined,
    });
  }

  if (!options.captureString) return;

  const prefix = `${timestamp} [${scope}:${level}]`;
  let logLine: string;
  if (context && typeof context === "object") {
    try {
      const dataStr = Object.entries(context as Record<string, unknown>)
        .map(([k, v]) =>
          typeof v === "object" && v !== null ? `${k}=${JSON.stringify(v)}` : `${k}=${v}`,
        )
        .join(", ");
      logLine = `${prefix} ${message} {${dataStr}}`;
    } catch {
      logLine = `${prefix} ${message} {[serialization failed]}`;
    }
  } else {
    logLine = `${prefix} ${message}`;
  }

  if (loggerState.logBuffer.length >= MAX_BUFFER_SIZE) {
    loggerState.logBuffer.shift();
  }

  loggerState.logBuffer.push(logLine);
}
