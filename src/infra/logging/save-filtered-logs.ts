import { filterLogs } from './logger-structured-log-access';
import { logTimestamp } from './log-timestamp';
import { saveLogEntries } from './save-log-entries';

export function saveFilteredLogs(scope: string, filename?: string): void {
  if (typeof document === 'undefined') return;
  const logs = filterLogs(scope);
  if (logs.length === 0) return;
  const timestamp = logTimestamp();
  saveLogEntries(logs, filename || `anqr-${scope.toLowerCase()}-logs-${timestamp}.json`);
}
