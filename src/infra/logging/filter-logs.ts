import { loggerState } from "./logger-state";
import type { StructuredLogEntry } from "./logger-types";

export function filterLogs(scope: string): StructuredLogEntry[] {
  const upperScope = scope.toUpperCase();
  return loggerState.structuredLogBuffer.filter(
    (entry) => entry.scope.toUpperCase() === upperScope,
  );
}
