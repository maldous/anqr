/**
 * Scan Logging Telemetry
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('TELEMETRY');

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

export function createScanLogger(): ScanLogger {
  const logs: LogEntry[] = [];
  let totalScans = 0;
  let successfulScans = 0;
  let failedScans = 0;
  let totalScanTime = 0;

  return {
    log(category: string, message: string, data?: Record<string, unknown>) {
      logs.push({
        timestamp: Date.now(),
        category,
        message,
        data,
      });

      // Track scan statistics
      if (category === 'scan') {
        totalScans++;
        if (data?.success) {
          successfulScans++;
        } else if (data?.success === false) {
          failedScans++;
        }
        if (typeof data?.duration === 'number') {
          totalScanTime += data.duration;
        }
      }
    },

    getStats(): ScanStats {
      return {
        totalScans,
        successfulScans,
        failedScans,
        averageScanTime: totalScans > 0 ? totalScanTime / totalScans : 0,
        logs: [...logs],
      };
    },

    getLogs(): LogEntry[] {
      return [...logs];
    },

    clear() {
      logs.length = 0;
      totalScans = 0;
      successfulScans = 0;
      failedScans = 0;
      totalScanTime = 0;
    },
  };
}
