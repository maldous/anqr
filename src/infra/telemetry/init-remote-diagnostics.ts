import {
  clearStructuredLogs,
  filterLogs,
  filterLogsByLevel,
  filterLogsByScopes,
  getStructuredLogCount,
  getStructuredLogs,
  saveFilteredLogs,
  saveLogs,
  setLogLevel,
} from "../logging/logger";
import { log } from "./log";
import { readState } from "./read-state";
import { writeState } from "./write-state";
import { enableDiagnostics } from "./enable-diagnostics";
import { disableDiagnostics } from "./disable-diagnostics";
import { getDiagnosticsStatus } from "./get-diagnostics-status";

/**
 * Initialize remote diagnostics on app startup.
 * Checks for existing diagnostic state and applies it.
 * Should be called early in app initialization, after Sentry.
 */
export function initRemoteDiagnostics(): void {
  const state = readState();

  if (state?.enabled) {
    if (Date.now() > state.expiresAt) {
      // Expired - clean up and use default level
      writeState(null);
      log.info("Diagnostics expired on restart, reverting to default level");
    } else {
      // Still valid - apply debug level
      setLogLevel("debug");
      const remaining = Math.round((state.expiresAt - Date.now()) / 60000);
      log.info("Diagnostics restored from storage", {
        remainingMinutes: remaining,
        reason: state.reason,
      });
    }
  }

  // Expose to window for console access
  if (globalThis.window !== undefined) {
    (globalThis as typeof globalThis & { anqrDiag?: unknown }).anqrDiag = {
      enable: enableDiagnostics,
      disable: disableDiagnostics,
      status: () => {
        const s = getDiagnosticsStatus();

        return s;
      },
      // Log saving functions
      saveLogs: (filename?: string) => {
        saveLogs(filename);
      },
      saveQartLogs: (filename?: string) => {
        saveFilteredLogs("QART", filename);
      },
      saveByScope: (scope: string, filename?: string) => {
        saveFilteredLogs(scope, filename);
      },
      getLogs: () => {
        const logs = getStructuredLogs();

        return logs;
      },
      getQartLogs: () => {
        const logs = filterLogs("QART");

        return logs;
      },
      getLogsByScope: (scope: string) => {
        const logs = filterLogs(scope);

        return logs;
      },
      getLogsByScopes: (scopes: string[]) => {
        const logs = filterLogsByScopes(scopes);

        return logs;
      },
      getErrors: () => {
        const logs = filterLogsByLevel(["error", "warn"]);

        return logs;
      },
      clearLogs: () => {
        clearStructuredLogs();
      },
      logCount: () => {
        const count = getStructuredLogCount();

        return count;
      },
      help: () => {},
    };
  }
}
