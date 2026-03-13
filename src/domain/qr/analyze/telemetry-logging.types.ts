export type { ScanStats } from './scan-stats';
export type { ScanLogger } from './scan-logger';

export interface LogEntry {
  timestamp: number;
  category: string;
  message: string;
  data?: Record<string, unknown>;
}
