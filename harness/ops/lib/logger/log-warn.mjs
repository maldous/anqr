import { LOG_LEVELS } from "./log-levels.mjs";
import { formatLogEntry } from "./format-log-entry.mjs";

export function logWarn(currentLogLevel, msg, data) {
  if (currentLogLevel <= LOG_LEVELS.WARN) {
    process.stderr.write(formatLogEntry("WARN", msg, data));
  }
}
