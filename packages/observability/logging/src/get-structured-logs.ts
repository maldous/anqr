import { loggerState } from "./logger-state";
import type { StructuredLogEntry } from "./logger-types";

export function getStructuredLogs(): StructuredLogEntry[] {
  return [...loggerState.structuredLogBuffer];
}
