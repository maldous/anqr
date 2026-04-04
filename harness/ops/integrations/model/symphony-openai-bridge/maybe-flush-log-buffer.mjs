import { INTERNAL_PATTERNS } from "./internal-patterns.mjs";
import { LOG_BUFFER_THRESHOLD } from "./log-buffer-threshold.mjs";
import { logDebug } from "./logger.mjs";

export function maybeFlushLogBuffer(state) {
  // Filter out internal activity markers for logging only
  let filteredLogBuffer = state.logBuffer;
  for (const pattern of INTERNAL_PATTERNS) {
    filteredLogBuffer = filteredLogBuffer.replace(pattern, "");
  }

  // Log when buffer exceeds threshold or contains sentence boundary
  const hasSentenceEnd = /[.!?]\s/.test(filteredLogBuffer) || filteredLogBuffer.includes("\n\n");
  if (filteredLogBuffer.length >= LOG_BUFFER_THRESHOLD || hasSentenceEnd) {
    const toLog = filteredLogBuffer.trim();
    if (toLog.length > 0) {
      logDebug(`🌊 ${toLog.slice(0, 200)}`);
    }
    state.logBuffer = ""; // Clear buffer after logging
  }
}
