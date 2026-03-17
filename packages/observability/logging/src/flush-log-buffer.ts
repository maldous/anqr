import { loggerState } from "./logger-state";

export function flushLogBuffer(): string {
  const result = loggerState.logBuffer.join("\n");
  loggerState.logBuffer = [];
  return result;
}
