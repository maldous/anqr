import { existsSync, readFileSync, unlinkSync } from "node:fs";

import { getOutcomeFile } from "./outcome-file.mjs";

/**
 * Read the runner outcome from disk (called by the HTTP layer).
 * Returns null if no outcome file exists or if the file is stale.
 * @param {string} [expectedCorrelationId] - If provided, only return outcomes matching this correlation ID
 * @returns {object|null}
 */
export function readRunnerOutcome(expectedCorrelationId) {
  const path = getOutcomeFile();
  try {
    if (!existsSync(path)) return null;
    const raw = readFileSync(path, "utf-8");
    const record = JSON.parse(raw);
    // Stale outcome guard: if the outcome file was written by a different
    // run (e.g. previous invocation that crashed), discard it. The
    // correlationId is passed via ANQR_CORRELATION_ID env var to the runner
    // and written into the outcome record — this gives the HTTP layer a
    // cross-process identifier to validate.
    if (expectedCorrelationId && record.correlationId && record.correlationId !== expectedCorrelationId) {
      // Caller (execute-linear-issue-request.mjs) logs the discard
      return null;
    }
    // Also discard outcomes older than 30 minutes (safety net)
    if (record.writtenAt) {
      const ageMs = Date.now() - new Date(record.writtenAt).getTime();
      if (ageMs > 30 * 60 * 1000) {
        // Caller (execute-linear-issue-request.mjs) logs the discard
        return null;
      }
    }
    return record;
  } catch {
    return null;
  } finally {
    // Clean up after reading
    try {
      if (existsSync(path)) unlinkSync(path);
    } catch {}
  }
}
