import { filterLogs, getStructuredLogs } from './logger-structured-log-access';
import type { StructuredLogEntry } from './logger-types';

function saveLogEntries(logs: StructuredLogEntry[], filename: string): void {
  if (typeof document === 'undefined') return;
  if (logs.length === 0) return;

  const json = JSON.stringify(logs, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function saveLogs(filename?: string): void {
  if (typeof document === 'undefined') return;
  const logs = getStructuredLogs();
  if (logs.length === 0) return;
  const timestamp = new Date().toISOString().replaceAll(/[:.]/g, '-');
  saveLogEntries(logs, filename || `anqr-logs-${timestamp}.json`);
}

export function saveFilteredLogs(scope: string, filename?: string): void {
  if (typeof document === 'undefined') return;
  const logs = filterLogs(scope);
  if (logs.length === 0) return;
  const timestamp = new Date().toISOString().replaceAll(/[:.]/g, '-');
  saveLogEntries(logs, filename || `anqr-${scope.toLowerCase()}-logs-${timestamp}.json`);
}
