import { loggerState } from "./logger-state";
import type { StructuredLogEntry } from "./logger-types";

export function filterLogsByScopes(scopes: string[]): StructuredLogEntry[] {
  const upperScopes = new Set(scopes.map((scope) => scope.toUpperCase()));
  return loggerState.structuredLogBuffer.filter((entry) =>
    upperScopes.has(entry.scope.toUpperCase()),
  );
}
