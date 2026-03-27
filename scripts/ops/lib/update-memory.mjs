/**
 * update-memory.mjs — Shared utility for runtime event logging
 *
 * Writes runtime events to reports/runtime-events.log (gitignored)
 * to avoid tainting git status during Symphony runner operations.
 *
 * MEMORY.md remains for human-curated summaries only (updated via Linear issues).
 */

import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { createLogger } from "./logger.mjs";

const { logInfo, logWarn } = createLogger();

/**
 * Append a timestamped runtime event to reports/runtime-events.log
 * @param {string} note - The event to log (without timestamp/formatting)
 * @param {string} [cwd] - Working directory (defaults to process.cwd())
 * @returns {Promise<void>}
 */
export async function updateMemory(note, cwd = process.cwd()) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${note}\n`;
  const reportsDir = path.join(cwd, "reports");
  const logFile = path.join(reportsDir, "runtime-events.log");
  
  try {
    // Ensure reports directory exists
    await mkdir(reportsDir, { recursive: true });
    await appendFile(logFile, entry);
    logInfo(`[update-memory] 📝 Logged runtime event: ${note}`);
  } catch (err) {
    logWarn(`[update-memory] ⚠️ Failed to log runtime event: ${err.message}`);
  }
}
