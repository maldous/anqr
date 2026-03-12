export interface LogEntry {
  timestamp: number;
  category: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface ScanStats {
  totalScans: number;
  successfulScans: number;
  failedScans: number;
  averageScanTime: number;
  logs: LogEntry[];
}

export interface ScanLogger {
  log(category: string, message: string, data?: Record<string, unknown>): void;
  getStats(): ScanStats;
  getLogs(): LogEntry[];
  clear(): void;
}
