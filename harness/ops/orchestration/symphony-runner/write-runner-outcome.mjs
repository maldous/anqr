import { writeFileSync } from "node:fs";

import { RUN_ID } from "./run-id.mjs";
import { logDebug } from "./logger.mjs";
import { getOutcomeFile } from "./outcome-file.mjs";

/**
 * Write the runner outcome to disk.
 * @param {object} outcome
 * @param {string} outcome.result - One of: no_changes, validation_failed,
 *   commit_failed, push_failed, local_commit_complete, integration_pending,
 *   skip, lease_lost, cooldown, retry_exhausted, backlog, false_positive
 * @param {string} outcome.issueIdentifier - Linear issue identifier
 * @param {string} [outcome.branch] - Branch name (if commit/push occurred)
 * @param {string} [outcome.headSha] - HEAD SHA (if commit occurred)
 * @param {number} [outcome.changedFiles] - Number of files changed
 * @param {string} [outcome.finalizationState] - Symphony finalization state
 * @param {string} [outcome.reason] - Human-readable reason
 */
export function writeRunnerOutcome(outcome) {
  const path = getOutcomeFile();
  try {
    // Include correlationId (from ANQR_CORRELATION_ID env) for cross-process
    // stale guard — the HTTP layer passes this env var to the runner and
    // can verify it on read to detect stale outcome files from crashed runs.
    const correlationId = process.env.ANQR_CORRELATION_ID || null;
    const record = { ...outcome, runId: RUN_ID, correlationId, writtenAt: new Date().toISOString() };
    writeFileSync(path, JSON.stringify(record, null, 2), "utf-8");
    logDebug(`[runner] Wrote outcome file: ${path} → ${outcome.result}`);
  } catch (err) {
    logDebug(`[runner] Failed to write outcome file: ${err.message}`);
  }
}
