/**
 * Scan Logging Telemetry
 */

import { createLogger } from "../../../../observability/logging/src";

const _log = createLogger("TELEMETRY");

export type { LogEntry, ScanStats, ScanLogger } from "./telemetry-logging.types";
import type { LogEntry, ScanStats, ScanLogger } from "./telemetry-logging.types";

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
      if (category === "scan") {
        totalScans++;
        if (data?.success) {
          successfulScans++;
        } else if (data?.success === false) {
          failedScans++;
        }
        if (typeof data?.duration === "number") {
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
