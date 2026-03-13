import type { LogEntry } from './telemetry-logging.types';

export interface ScanStats {
  totalScans: number;
  successfulScans: number;
  failedScans: number;
  averageScanTime: number;
  logs: LogEntry[];
}
