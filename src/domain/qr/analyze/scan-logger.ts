import type { LogEntry } from './telemetry-logging.types';
import type { ScanStats } from './scan-stats';

export interface ScanLogger {
  log(category: string, message: string, data?: Record<string, unknown>): void;
  getStats(): ScanStats;
  getLogs(): LogEntry[];
  clear(): void;
}
