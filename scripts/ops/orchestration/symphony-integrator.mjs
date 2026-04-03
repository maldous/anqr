#!/usr/bin/env node

/**
 * symphony-integrator.mjs — Single writer to origin/main
 *
 * Reads integration queue from shared state, serially promotes
 * queued worktree branches to origin/main via cherry-pick.
 *
 * Only this process should ever push to origin/main.
 *
 * Usage:
 *   node scripts/ops/orchestration/symphony-integrator.mjs once
 *   node scripts/ops/orchestration/symphony-integrator.mjs daemon
 *   node scripts/ops/orchestration/symphony-integrator.mjs status
 */

import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { createLogger } from "../lib/logger.mjs";
import {
  listIntegrationCandidates,
  dequeueIntegrationCandidate,
  acquireIntegrationLock,
  releaseIntegrationLock,
  getFinalizationState,
  setFinalizationState,
  getIssueState,
} from "../symphony-state.mjs";
import { updateIssue, addComment, getIssueDetail, STATES } from "../linear-client.mjs";
import { PROJECT_ROOT } from "../core/worktree-config.mjs";

const { logInfo, logWarn, logError, logDebug } = createLogger();

const INTEGRATOR_ID = `integrator-${process.pid}`;
const POLL_INTERVAL_MS = Number(process.env.ANQR_INTEGRATOR_POLL_MS || 30_000);
const LOCK_TTL_MS = 10 * 60 * 1000;

function git(...args) {
  return execFileSync("git", args, {
    cwd: PROJECT_ROOT,
    encoding: "utf-8",
    stdio: "pipe",
    timeout: 60_000,
    env: { ...process.env, ANQR_AUTOMATION_PUSH: "1" },
  }).trim();
}

/**
 * Process a single integration candidate.
 * Cherry-picks the candidate's head commit onto origin/main and pushes.
 */
async function integrateCandidate(issueIdentifier) {
  const finalization = getFinalizationState(issueIdentifier);
  if (!finalization || finalization.state !== "integration_pending") {
    logWarn(`[integrator] ${issueIdentifier}: unexpected finalization state: ${finalization?.state}`);
    dequeueIntegrationCandidate(issueIdentifier);
    return { ok: false, reason: "invalid_state" };
  }

  const { branch, headSha } = finalization;
  if (!branch || !headSha) {
    logWarn(`[integrator] ${issueIdentifier}: missing branch or headSha`);
    return { ok: false, reason: "missing_metadata" };
  }

  logInfo(`[integrator] Integrating ${issueIdentifier}: branch=${branch} head=${headSha.slice(0, 8)}`);

  try {
    // Fetch latest refs
    git("fetch", "origin", "main", branch);

    // Create clean integration workspace
    try {
      git("branch", "-D", "symphony/integration");
    } catch { /* branch may not exist */ }
    git("checkout", "-B", "symphony/integration", "origin/main");

    // Cherry-pick the candidate commit
    try {
      git("cherry-pick", headSha);
    } catch (cpErr) {
      // Cherry-pick failed — likely a conflict
      const stderr = cpErr.stderr?.toString() || cpErr.message || "";
      logWarn(`[integrator] Cherry-pick failed for ${issueIdentifier}: ${stderr.slice(0, 200)}`);

      // Abort the cherry-pick
      try { git("cherry-pick", "--abort"); } catch { /* already clean */ }

      // Return to main
      try { git("checkout", "main"); } catch { /* best effort */ }

      // Mark as integration_failed_repairable
      const attempts = (finalization.attempts || 0) + 1;
      await setFinalizationState(issueIdentifier, {
        state: "integration_failed_repairable",
        lastError: stderr.slice(0, 500),
        attempts,
        updatedAt: new Date().toISOString(),
      });

      // Update Linear
      const issueState = getIssueState(issueIdentifier);
      const detail = issueState ? await findIssueByIdentifier(issueIdentifier) : null;
      if (detail) {
        await updateIssue(detail.id, { stateId: STATES.inReview });
        await addComment(
          detail.id,
          `⚠️ Integration to main failed due to conflict. Returned to same worktree for repair.\n\nError: ${stderr.slice(0, 300)}`,
        );
      }

      dequeueIntegrationCandidate(issueIdentifier);
      return { ok: false, reason: "conflict" };
    }

    // Push to main
    git("push", "origin", "HEAD:main");
    const pushedMainSha = git("rev-parse", "HEAD");

    logInfo(`[integrator] ✅ ${issueIdentifier} integrated to main at ${pushedMainSha.slice(0, 8)}`);

    // Return to main branch
    try { git("checkout", "main"); } catch { /* best effort */ }

    // Update finalization state
    await setFinalizationState(issueIdentifier, {
      state: "integrated_main",
      integratedMainSha: pushedMainSha,
      updatedAt: new Date().toISOString(),
      lastError: null,
    });

    // Update Linear to Done
    const detail = await findIssueByIdentifier(issueIdentifier);
    if (detail) {
      await updateIssue(detail.id, { stateId: STATES.done });
      await addComment(
        detail.id,
        `✅ Integrated to origin/main at ${pushedMainSha.slice(0, 8)}.`,
      );
    }

    dequeueIntegrationCandidate(issueIdentifier);
    return { ok: true, mainSha: pushedMainSha };
  } catch (err) {
    logError(`[integrator] Unexpected error for ${issueIdentifier}: ${err.message}`);

    // Return to main branch
    try { git("checkout", "main"); } catch { /* best effort */ }

    // Mark as repairable on infra failure
    const attempts = (finalization.attempts || 0) + 1;
    await setFinalizationState(issueIdentifier, {
      state: "integration_failed_repairable",
      lastError: err.message.slice(0, 500),
      attempts,
      updatedAt: new Date().toISOString(),
    });

    dequeueIntegrationCandidate(issueIdentifier);
    return { ok: false, reason: "infra_error", error: err.message };
  }
}

/**
 * Look up a Linear issue by identifier.
 */
async function findIssueByIdentifier(identifier) {
  try {
    const { findOpenIssuesByIdentifier } = await import("../linear-client.mjs");
    const results = await findOpenIssuesByIdentifier(identifier);
    return results?.[0] || null;
  } catch {
    return null;
  }
}

/**
 * Process all candidates in the integration queue.
 */
async function processQueue() {
  const candidates = listIntegrationCandidates();
  if (candidates.length === 0) {
    logDebug(`[integrator] Queue empty`);
    return { processed: 0 };
  }

  logInfo(`[integrator] Queue has ${candidates.length} candidate(s): ${candidates.join(", ")}`);

  // Acquire global integration lock
  const lock = acquireIntegrationLock(INTEGRATOR_ID, LOCK_TTL_MS);
  if (!lock.ok) {
    logWarn(`[integrator] Lock held by ${lock.holder} (expires ${lock.expiresAt}) — skipping cycle`);
    return { processed: 0, reason: "locked" };
  }

  let processed = 0;
  try {
    for (const issueIdentifier of candidates) {
      const result = await integrateCandidate(issueIdentifier);
      processed++;
      if (result.ok) {
        logInfo(`[integrator] ✅ ${issueIdentifier}: integrated`);
      } else {
        logWarn(`[integrator] ❌ ${issueIdentifier}: ${result.reason}`);
      }
    }
  } finally {
    releaseIntegrationLock(INTEGRATOR_ID);
  }

  return { processed };
}

/**
 * Show integrator status.
 */
function showStatus() {
  const candidates = listIntegrationCandidates();
  console.log("\n=== Integration Queue ===");
  console.log(`Candidates: ${candidates.length}`);
  for (const id of candidates) {
    const fin = getFinalizationState(id);
    console.log(`  ${id}: state=${fin?.state || "unknown"} branch=${fin?.branch || "?"} head=${fin?.headSha?.slice(0, 8) || "?"}`);
  }
  console.log();
}

/**
 * Run in daemon mode — poll queue periodically.
 */
async function runDaemon() {
  logInfo(`[integrator] Starting daemon mode (poll every ${POLL_INTERVAL_MS / 1000}s)`);

  const shutdown = (signal) => {
    logInfo(`[integrator] Received ${signal}, shutting down...`);
    releaseIntegrationLock(INTEGRATOR_ID);
    process.exit(0);
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  while (true) {
    try {
      await processQueue();
    } catch (err) {
      logError(`[integrator] Queue processing error: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
}

// CLI
const mode = process.argv[2];
if (mode === "once") {
  processQueue()
    .then((result) => {
      logInfo(`[integrator] Processed ${result.processed} candidate(s)`);
      process.exit(0);
    })
    .catch((err) => {
      logError(`[integrator] Fatal: ${err.message}`);
      process.exit(1);
    });
} else if (mode === "daemon") {
  runDaemon().catch((err) => {
    logError(`[integrator] Fatal: ${err.message}`);
    process.exit(1);
  });
} else if (mode === "status") {
  showStatus();
} else {
  console.error("Usage: symphony-integrator.mjs <once|daemon|status>");
  process.exit(2);
}
