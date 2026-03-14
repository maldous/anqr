import { getStructuredLogs } from './logger-structured-log-access';
import { logTimestamp } from './log-timestamp';
import { saveLogEntries } from './save-log-entries';
export { saveFilteredLogs } from './save-filtered-logs';

export function saveLogs(filename?: string): void {
  if (typeof document === 'undefined') return;
  const logs = getStructuredLogs();
  if (logs.length === 0) return;
  const timestamp = logTimestamp();
  saveLogEntries(logs, filename || `anqr-logs-${timestamp}.json`);
}
