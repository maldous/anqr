import type { LogEntry } from "./log-entry";

export interface ScanStats {
  totalScans: number;
  successfulScans: number;
  failedScans: number;
  averageScanTime: number;
  logs: LogEntry[];
}
