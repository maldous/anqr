import { loggerState } from "./logger-state";

export function clearStructuredLogs(): void {
  loggerState.structuredLogBuffer = [];
}
