import { loggerState } from './logger-state';
import type { StructuredLogEntry } from './logger-types';

export function getStructuredLogs(): StructuredLogEntry[] {
  return [...loggerState.structuredLogBuffer];
}

export function clearStructuredLogs(): void {
  loggerState.structuredLogBuffer = [];
}

export function getStructuredLogCount(): number {
  return loggerState.structuredLogBuffer.length;
}

export function filterLogs(scope: string): StructuredLogEntry[] {
  const upperScope = scope.toUpperCase();
  return loggerState.structuredLogBuffer.filter(
    (entry) => entry.scope.toUpperCase() === upperScope
  );
}

export function filterLogsByScopes(scopes: string[]): StructuredLogEntry[] {
  const upperScopes = new Set(scopes.map((s) => s.toUpperCase()));
  return loggerState.structuredLogBuffer.filter((entry) =>
    upperScopes.has(entry.scope.toUpperCase())
  );
}

export function filterLogsByLevel(levels: string[]): StructuredLogEntry[] {
  const lowerLevels = new Set(levels.map((l) => l.toLowerCase()));
  return loggerState.structuredLogBuffer.filter((entry) =>
    lowerLevels.has(entry.level.toLowerCase())
  );
}
