++ b/harness/ops/lib/logger/log-debug.mjs
import { LOG_LEVELS } from "./log-levels.mjs";
import { formatLogEntry } from "./format-log-entry.mjs";

export function logDebug(currentLogLevel, msg, data) {
  if (currentLogLevel <= LOG_LEVELS.DEBUG) {
    process.stderr.write(formatLogEntry("DEBUG", msg, data));
  }
}