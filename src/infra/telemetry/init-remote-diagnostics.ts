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
} from '../logging/logger';
import { log } from './log';
import { readState } from './read-state';
import { writeState } from './write-state';
import { enableDiagnostics } from './enable-diagnostics';
import { disableDiagnostics } from './disable-diagnostics';
import { getDiagnosticsStatus } from './get-diagnostics-status';

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
      log.info('Diagnostics expired on restart, reverting to default level');
    } else {
      // Still valid - apply debug level
      setLogLevel('debug');
      const remaining = Math.round((state.expiresAt - Date.now()) / 60000);
      log.info('Diagnostics restored from storage', {
        remainingMinutes: remaining,
        reason: state.reason,
      });
    }
  }

  // Expose to window for console access
  if (typeof window !== 'undefined') {
    (window as Window & { anqrDiag?: unknown }).anqrDiag = {
      enable: enableDiagnostics,
      disable: disableDiagnostics,
      status: () => {
        const s = getDiagnosticsStatus();
        console.log('ANQR Diagnostics Status:', s);
        return s;
      },
      // Log saving functions
      saveLogs: (filename?: string) => {
        saveLogs(filename);
      },
      saveQartLogs: (filename?: string) => {
        saveFilteredLogs('QART', filename);
      },
      saveByScope: (scope: string, filename?: string) => {
        saveFilteredLogs(scope, filename);
      },
      getLogs: () => {
        const logs = getStructuredLogs();
        console.log(`${logs.length} log entries (expand objects below):`);
        return logs;
      },
      getQartLogs: () => {
        const logs = filterLogs('QART');
        console.log(`${logs.length} QART log entries (expand objects below):`);
        return logs;
      },
      getLogsByScope: (scope: string) => {
        const logs = filterLogs(scope);
        console.log(`${logs.length} '${scope}' log entries:`);
        return logs;
      },
      getLogsByScopes: (scopes: string[]) => {
        const logs = filterLogsByScopes(scopes);
        console.log(`${logs.length} log entries for scopes [${scopes.join(', ')}]:`);
        return logs;
      },
      getErrors: () => {
        const logs = filterLogsByLevel(['error', 'warn']);
        console.log(`${logs.length} error/warning entries:`);
        return logs;
      },
      clearLogs: () => {
        clearStructuredLogs();
        console.log('Structured log buffer cleared.');
      },
      logCount: () => {
        const count = getStructuredLogCount();
        console.log(`${count} log entries in buffer`);
        return count;
      },
      help: () => {
        console.log(`
ANQR Diagnostics Commands:
  anqrDiag.enable(minutes?, reason?)  - Enable debug logging (default 60 min)
  anqrDiag.disable()                  - Disable debug logging
  anqrDiag.status()                   - Show current status

Log Saving (objects fully expanded in JSON output):
  anqrDiag.saveLogs(filename?)        - Download ALL logs as JSON file
  anqrDiag.saveQartLogs(filename?)    - Download only QART logs
  anqrDiag.saveByScope(scope, file?)  - Download logs for a specific scope

Log Viewing (in console):
  anqrDiag.getLogs()                  - Get all logs (expandable in console)
  anqrDiag.getQartLogs()              - Get only QART logs
  anqrDiag.getLogsByScope(scope)      - Get logs for a specific scope
  anqrDiag.getLogsByScopes([...])     - Get logs for multiple scopes
  anqrDiag.getErrors()                - Get only errors and warnings

Log Management:
  anqrDiag.clearLogs()                - Clear the log buffer
  anqrDiag.logCount()                 - Show number of buffered logs
  anqrDiag.help()                     - Show this help

Examples:
  anqrDiag.enable(30, 'debugging QR-Art')  - Enable debug for 30 minutes
  anqrDiag.saveLogs()                      - Downloads all logs
  anqrDiag.saveQartLogs()                  - Downloads only QART-related logs
  anqrDiag.getLogsByScopes(['QART', 'GENERATE', 'DECODER'])

Note: Log buffer holds up to 5000 entries. Oldest entries are dropped when full.
        `);
      },
    };
  }
}
