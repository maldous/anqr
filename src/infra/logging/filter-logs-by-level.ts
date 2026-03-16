import { loggerState } from "./logger-state";
import type { StructuredLogEntry } from "./logger-types";

export function filterLogsByLevel(levels: string[]): StructuredLogEntry[] {
  const lowerLevels = new Set(levels.map((level) => level.toLowerCase()));
  return loggerState.structuredLogBuffer.filter((entry) =>
    lowerLevels.has(entry.level.toLowerCase()),
  );
}
