import {
  acquireLease,
  releaseLease,
  heartbeatLease,
  noteAttemptStart,
  markRetryExhausted,
  setCooldown,
  clearCooldown,
  getIssueState,
  recordTransition,
  patchIssueState,
  recordCompletion,
  recordRetryEvent,
  calculateExponentialBackoff,
  setFinalizationState,
  getFinalizationState,
  enqueueIntegrationCandidate,
  setWorktreeState,
  getWorktreeState,
} from "../../symphony-state.mjs";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
  mkdirSync,
  appendFileSync,
} from "node:fs";
import {
  updateIssue,
  addComment,
  updateComment,
  getIssueDetail,
  STATES,
} from "../../linear-client.mjs";
import {
  RUNNER_MAX_RETRIES,
  RUNNER_AUTO_PUSH,
  RUNNER_MAX_VALIDATION_FIXES,
  RUNNER_VALIDATION_FIX_TURNS,
  RUNNER_ISSUE_COOLDOWN_MS,
  RUNNER_VALIDATION_REPAIR_MAX,
  RUNNER_MAX_TURNS,
  RUNNER_MAX_EXECUTION_MS,
  HEARTBEAT_INTERVAL_MS,
  MAX_CONCURRENT_AGENTS,
} from "../../symphony-config.mjs";
import { recordLinearCompletion, recordProviderSuccess } from "../../symphony-credit-gate.mjs";
import { isDiscordWorktree } from "../../core/worktree-config.mjs";
import { resolve } from "node:path";
import { runAgent, continueAgent } from "../../symphony-agent.mjs";
import { runValidation, formatValidationFeedback } from "../../symphony-validation.mjs";
import { getQueueSnapshot } from "../../symphony-queue-control.mjs";
import { sendDiscordEmbed } from "../../integrations/notifications/openclaw-discord.mjs";

import { LEASE_TTL_MS } from "./lease-ttl-ms.mjs";
import { ROOT } from "./root.mjs";
import { RUN_ID } from "./run-id.mjs";
import { SYNC_FAILURE_THRESHOLD } from "./sync-failure-threshold.mjs";
import { SYNC_FAIL_COUNT_FILE } from "./sync-fail-count-file.mjs";
import { WORKFLOW_PATH } from "./workflow-path.mjs";
import { WORKTREE_ID } from "./worktree-id.mjs";
import { classifyProviderFailure } from "./classify-provider-failure.mjs";
import { currentBranchNameForRunner } from "./current-branch-name-for-runner.mjs";
import { getRepoHeadSha } from "./get-repo-head-sha.mjs";
import { getRunnerProvider } from "./get-runner-provider.mjs";
import { gitCommit } from "./git-commit.mjs";
import { gitDiffNames } from "./git-diff-names.mjs";
import { gitDiffStat } from "./git-diff-stat.mjs";
import { gitPushWorktreeBranch } from "./git-push-worktree-branch.mjs";
import { gitRevert } from "./git-revert.mjs";
import { releaseLock } from "./release-lock.mjs";
import { runSonarPostCommit } from "./run-sonar-post-commit.mjs";
import { syncFailCount, setSyncFailCount } from "./sync-fail-count.mjs";
import { syncWorktreeBeforeValidation } from "./sync-worktree-before-validation.mjs";
import { logInfo, logWarn, logError, logDebug } from "./logger.mjs";

export async function executeIssue(issue, dryRun = false) {
  // Phase 2: Detect repair candidate to skip sync and provide repair context
  const currentFinalization = getFinalizationState(issue.identifier);
  const isRepairCandidate =
    currentFinalization &&
    [
      "validation_failed_repairable",
      "commit_failed_repairable",
      "branch_push_failed_repairable",
      "integration_failed_repairable",
    ].includes(currentFinalization.state);

  if (isRepairCandidate) {
    logInfo(
      `[runner] 🔧 Repair candidate detected: ${issue.identifier} (${currentFinalization.state})`,
    );
  }

  // Worktree sync: ensure worktree is synced with main before starting
  // IMPORTANT: This happens BEFORE lease acquisition to avoid wasting lease cycles on sync failures
  // Skip sync for repair candidates to preserve dirty tree
  if (WORKTREE_ID !== "main" && !isRepairCandidate) {
    logDebug(`[worktree-sync] Starting sync for WORKTREE_ID: ${WORKTREE_ID}`);
    logDebug(`[worktree-sync] Sync working directory (ROOT): ${ROOT}`);
    logDebug(
      `[worktree-sync] Current sync failure count: ${syncFailCount}/${SYNC_FAILURE_THRESHOLD}`,
    );

    try {
      logInfo(`[runner] 🔄 Syncing worktree ${WORKTREE_ID} with main...`);
      logDebug(`[worktree-sync] Executing: git fetch origin main (cwd: ${ROOT})`);
      execFileSync("git", ["fetch", "origin", "main"], { cwd: ROOT, stdio: "pipe" });

      logDebug(`[worktree-sync] Executing: git merge origin/main --ff-only (cwd: ${ROOT})`);
      execFileSync("git", ["merge", "origin/main", "--ff-only"], { cwd: ROOT, stdio: "pipe" });
      logInfo(`[runner] ✅ Worktree ${WORKTREE_ID} synced with main`);
      logDebug(`[worktree-sync] Sync successful`);

      // Reset failure counter on successful sync
      setSyncFailCount(0);
      try {
        if (existsSync(SYNC_FAIL_COUNT_FILE)) {
          unlinkSync(SYNC_FAIL_COUNT_FILE);
        }
      } catch {}
    } catch (err) {
      // Sync failed - release lock immediately and exit to avoid wasting lease cycles
      setSyncFailCount(syncFailCount + 1);

      // Persist incremented counter for next cycle
      try {
        writeFileSync(SYNC_FAIL_COUNT_FILE, String(syncFailCount));
      } catch {}

      logError(
        `[runner] ❌ Worktree sync failed (attempt ${syncFailCount}/${SYNC_FAILURE_THRESHOLD}): ${err.message}`,
      );

      // Check if merge conflict or other error
      const stderr = err.stderr?.toString() || "";
      const stdout = err.stdout?.toString() || "";
      const isConflict =
        stderr.includes("conflict") ||
        stdout.includes("conflict") ||
        stderr.includes("CONFLICT") ||
        stdout.includes("CONFLICT");

      if (isConflict) {
        logError(`[runner] Detected merge conflict - divergent changes exist in worktree`);
      } else {
        logError(`[runner] Sync error type: ${err.code || "unknown"}`);
      }

      logError(
        `[runner] ⏭️  Releasing lock and exiting immediately to avoid wasting lease acquisition cycle.`,
      );

      // Threshold reached - attempt hard reset
      if (syncFailCount >= SYNC_FAILURE_THRESHOLD) {
        logWarn(
          `[runner] ⚠️ Sync failure threshold reached (${syncFailCount}/${SYNC_FAILURE_THRESHOLD})`,
        );
        logWarn(`[runner] Attempting hard reset to origin/main to recover...`);

        try {
          execFileSync("git", ["reset", "--hard", "origin/main"], { cwd: ROOT, stdio: "pipe" });
          execFileSync("git", ["clean", "-fd"], { cwd: ROOT, stdio: "pipe" });
          logInfo(`[runner] ✅ Worktree ${WORKTREE_ID} reset to origin/main successfully`);

          // Reset counter after successful recovery
          setSyncFailCount(0);
          try {
            if (existsSync(SYNC_FAIL_COUNT_FILE)) {
              unlinkSync(SYNC_FAIL_COUNT_FILE);
            }
          } catch {}

          logInfo(`[runner] ✅ Recovery complete. Next cycle will use clean worktree.`);
          logInfo(`[runner] Releasing lock and exiting cleanly.`);

          // ROLLBACK: Release lock and exit after successful reset
          // Next cycle will start fresh with clean worktree
          releaseLock();
          return "skip";
        } catch (resetErr) {
          logError(`[runner] ❌ Hard reset failed: ${resetErr.message}`);
          logError(`[runner] ⛔ Manual intervention required for worktree ${WORKTREE_ID}`);
          logError(
            `[runner] Recovery command: cd ${ROOT} && git reset --hard origin/main && git clean -fd`,
          );

          // ROLLBACK: Release lock immediately and exit - manual intervention required
          releaseLock();
          return "skip";
        }
      }

      // ROLLBACK: Release lock immediately on sync failure - no lease was acquired yet
      // This is the key improvement: exit early instead of continuing to lease acquisition
      logError(
        `[runner] Will retry sync on next runner cycle (${syncFailCount}/${SYNC_FAILURE_THRESHOLD} failures so far).`,
      );

      // Release lock and exit - don't attempt to acquire lease
      releaseLock();
      return "skip";
    }
  }

  // Pre-execution check: verify issue wasn't already completed externally
  const detail = await getIssueDetail(issue.id);
  if (!detail) return "skip";

  // Deterministic external completion check: use Linear API state, not text inference
  if (detail.state?.name === "Done" || detail.state?.name === "Canceled") {
    logInfo(`[runner] Issue ${issue.identifier} already completed externally — skipping`);
    return "skip";
  }

  const issueStartMs = Date.now();
  const getRemainingMs = () => RUNNER_MAX_EXECUTION_MS - (Date.now() - issueStartMs);
  let leaseValid = true;
  const state = getIssueState(issue.identifier);
  // Capture prior failure info BEFORE noteAttemptStart clears it (used for fingerprinting)
  const _priorFailureReason = state.last_failure_reason;
  const priorFailureSignature = state.last_failure_signature;

  // Check retry limit BEFORE acquiring lease or incrementing retry_count
  if (state.retry_count >= RUNNER_MAX_RETRIES) {
    logInfo(
      `[runner] Issue ${issue.identifier} has exhausted retries (${state.retry_count}/${RUNNER_MAX_RETRIES}) — moving to Backlog`,
    );
    await updateIssue(issue.id, { stateId: STATES.backlog });
    markRetryExhausted(issue.identifier, { reason: "retry_exhausted" });
    recordTransition(issue.identifier, {
      actor: "runner",
      reason: "retry_exhausted",
      from: issue.state?.name || "Todo",
      to: "Backlog",
      runId: RUN_ID,
    });
    await addComment(
      issue.id,
      `🚫 **Max retries exceeded** (${RUNNER_MAX_RETRIES}). Moved to Backlog and blocked from automatic re-feed until explicitly reset.`,
    );
    // Track retry exhausted as provider failure (use last provider from state)
    const lastProvider = state.lastProvider;
    if (lastProvider) {
      recordLinearCompletion(lastProvider, {
        completed: false,
        priority: issue.priority,
        estimate: issue.estimate,
      });
    }
    return "skip";
  }

  // Calculate attempt number after retry check passes
  const attempt = Number(state.retry_count || 0) + 1;
  logInfo(
    `[runner] Attempt ${attempt}/${RUNNER_MAX_RETRIES} for ${issue.identifier}: ${issue.title}`,
  );

  const leaseNonce = `${RUN_ID}:${issue.identifier}:${Date.now()}`;
  const lease = acquireLease(issue.identifier, {
    owner: "runner",
    nonce: leaseNonce,
    runId: RUN_ID,
    ttlMs: LEASE_TTL_MS,
  });
  if (!lease.ok) {
    logInfo(`[runner] Lease unavailable for ${issue.identifier} — skipping`);
    return "skip";
  }

  let startingCommentId = null;
  let heartbeatTimer = null;
  try {
    // Phase 0: Set worktree state to executing
    setWorktreeState(WORKTREE_ID, { state: "executing", issueIdentifier: issue.identifier });

    // Phase 2: Handle branch_push_failed_repairable — retry push before running agent
    if (isRepairCandidate && currentFinalization.state === "branch_push_failed_repairable") {
      logInfo(`[runner] 🔧 Retrying branch push for ${issue.identifier}...`);
      const retryPush = await gitPushWorktreeBranch();
      if (retryPush.ok) {
        setFinalizationState(issue.identifier, {
          state: "integration_pending",
          branch: retryPush.branch,
          headSha: retryPush.head,
          baseMainSha: getRepoHeadSha("origin/main"),
          attempts: 0,
          lastError: null,
        });
        enqueueIntegrationCandidate(issue.identifier);
        await updateIssue(issue.id, { stateId: STATES.inReview });
        await addComment(issue.id, "✅ Branch push retry succeeded — re-enqueued for integration.");
        recordTransition(issue.identifier, {
          actor: "runner",
          reason: "branch_push_retry_success",
          from: "In Review",
          to: "In Review",
          runId: RUN_ID,
        });
        return "done";
      }
      logWarn(`[runner] Branch push retry still failing: ${retryPush.error}`);
    }

    // Set source for routing based on worktree context
    // Discord worktrees (wt5-wt8) mark their issues as discord-sourced
    // Symphony worktrees (wt1-wt4, main) mark as linear-sourced
    const initialState = getIssueState(issue.identifier);
    const isDiscordWt = isDiscordWorktree(WORKTREE_ID);
    const issueSource = initialState.source || (isDiscordWt ? "discord" : "linear");
    noteAttemptStart(issue.identifier, { runId: RUN_ID, source: issueSource });
    clearCooldown(issue.identifier);
    // Background heartbeat keeps lease alive during long bridge calls.
    // On failure (lease_mismatch), mark lease lost — runner aborts safely after current call.
    heartbeatTimer = setInterval(() => {
      const hb = heartbeatLease(issue.identifier, leaseNonce, LEASE_TTL_MS);
      if (!hb.ok) {
        logWarn(
          `[runner] Heartbeat failed for ${issue.identifier}: ${hb.reason} — marking lease lost`,
        );
        leaseValid = false;
      }
    }, HEARTBEAT_INTERVAL_MS);
    await updateIssue(issue.id, { stateId: STATES.inProgress });
    recordTransition(issue.identifier, {
      actor: "runner",
      reason: "start_attempt",
      from: issue.state?.name || "Todo",
      to: "In Progress",
      runId: RUN_ID,
    });
    const startComment = await addComment(
      issue.id,
      `🤖 **Symphony agent starting** (Attempt ${attempt}/${RUNNER_MAX_RETRIES})\n\nRun: ${RUN_ID}\nLease: ${leaseNonce}`,
    );
    startingCommentId = startComment.id;
    if (dryRun) return "done";

    // NOTE: Discord notification removed from here to eliminate duplicate messages.
    // Only the final completion notification (below) is sent to Discord.

    let systemPrompt = "You are a coding agent. Implement the requested changes.";
    if (existsSync(WORKFLOW_PATH)) systemPrompt = readFileSync(WORKFLOW_PATH, "utf-8");

    // Phase 2: Add repair context for repairable states
    if (isRepairCandidate) {
      if (currentFinalization.state === "validation_failed_repairable") {
        const sidecarPath = resolve(ROOT, ".git", "SYMPHONY_VALIDATION_ERRORS");
        const validationErrors = existsSync(sidecarPath)
          ? readFileSync(sidecarPath, "utf-8")
          : currentFinalization.lastError || "unknown";
        systemPrompt += `\n\n## REPAIR CONTEXT\n\nThis is a validation repair attempt (${currentFinalization.attempts || 1}/${RUNNER_VALIDATION_REPAIR_MAX}). The previous run's changes are preserved in the working tree. Fix the following validation errors:\n\n${validationErrors}`;
      } else if (currentFinalization.state === "integration_failed_repairable") {
        systemPrompt += `\n\n## REPAIR CONTEXT\n\nThis is an integration conflict repair. The changes conflicted with recent main updates during cherry-pick. Error: ${currentFinalization.lastError || "unknown"}\n\nPlease resolve the conflicts and ensure compatibility with current main.`;
      } else if (currentFinalization.state === "commit_failed_repairable") {
        systemPrompt += `\n\n## REPAIR CONTEXT\n\nThe previous commit attempt failed. Error: ${currentFinalization.lastError || "unknown"}\n\nPlease fix any issues preventing a clean commit.`;
      }
    }

    const provider = getRunnerProvider();
    let agentResult = null;
    const currentState = getIssueState(issue.identifier);
    patchIssueState(issue.identifier, {
      notes: { ...currentState.notes, lastProvider: provider.name },
    });
    if (startingCommentId) {
      await updateComment(
        startingCommentId,
        `🤖 **Symphony agent starting** (Attempt ${attempt}/${RUNNER_MAX_RETRIES})\n\n**Route:** ${provider.model}\n**Gateway:** ${provider.name}\n**Run:** ${RUN_ID}`,
      );
    }
    // Wall-clock budget enforcement: abort if no time remains before starting agent
    {
      const remainingMs = getRemainingMs();
      if (remainingMs <= 0) {
        const signature = "wall_clock_exhausted";
        if (priorFailureSignature === signature) {
          markRetryExhausted(issue.identifier, {
            reason: "wall_clock_exhausted_repeated",
            signature,
          });
          await updateIssue(issue.id, { stateId: STATES.backlog });
          await addComment(
            issue.id,
            `🚫 **Wall-clock budget exhausted (repeated)** — quarantined to Backlog.`,
          );
          recordTransition(issue.identifier, {
            actor: "runner",
            reason: "wall_clock_exhausted_repeated",
            from: "In Progress",
            to: "Backlog",
            runId: RUN_ID,
          });
        } else {
          setCooldown(
            issue.identifier,
            RUNNER_ISSUE_COOLDOWN_MS,
            "wall_clock_exhausted",
            signature,
          );
          await updateIssue(issue.id, { stateId: STATES.todo });
          await addComment(
            issue.id,
            `⏰ **Wall-clock budget exhausted** — returned to Todo with cooldown.`,
          );
          recordTransition(issue.identifier, {
            actor: "runner",
            reason: "wall_clock_exhausted",
            from: "In Progress",
            to: "Todo",
            runId: RUN_ID,
          });
        }
        recordLinearCompletion(provider.name, {
          completed: false,
          priority: issue.priority,
          estimate: issue.estimate,
        });
        return "done";
      }
      heartbeatLease(issue.identifier, leaseNonce, LEASE_TTL_MS);
      try {
        agentResult = await runAgent({
          provider,
          issue: detail,
          projectRoot: ROOT,
          worktreeId: WORKTREE_ID,
          worktreeRoot: ROOT,
          leaseId: leaseNonce,
          executionMode: "mutating",
          systemPrompt,
          maxMs: remainingMs,
        });
      } catch (err) {
        agentResult = {
          completed: false,
          summary: `Agent execution failed: ${err.message}`,
          error: err.message,
          turns: 0,
          toolCalls: 0,
          filesChanged: [],
          timedOut: false,
          messages: [],
          providerName: provider.name,
        };
      }
    }
    // Lease validity check: if heartbeat lost the lease, abort safely
    if (!leaseValid) {
      logWarn(`[runner] Lease lost during execution of ${issue.identifier} — aborting safely`);
      gitRevert();
      recordTransition(issue.identifier, {
        actor: "runner",
        reason: "lease_lost",
        from: "In Progress",
        to: "Todo",
        runId: RUN_ID,
      });
      // Best-effort abandonment writeback
      try {
        await updateIssue(issue.id, { stateId: STATES.todo });
        await addComment(
          issue.id,
          `⚠️ **Run abandoned** — lease lost during agent execution. Changes reverted. No successful completion occurred.\n\nRun: ${RUN_ID}\nWorktree: ${WORKTREE_ID}`,
        );
      } catch (wbErr) { logWarn(`[runner] Abandonment writeback failed: ${wbErr.message}`); }
      sendDiscordEmbed({
        title: `⚠️ Abandoned | ${WORKTREE_ID}`,
        description: `${issue.identifier}: ${issue.title}`,
        color: 0xff0000,
        fields: [
          { name: "Reason", value: "Lease lost during execution", inline: true },
          { name: "Worktree", value: WORKTREE_ID, inline: true },
        ],
      }).catch(() => {});
      recordLinearCompletion(agentResult?.providerName || provider.name, {
        completed: false,
        priority: issue.priority,
        estimate: issue.estimate,
      });
      return "done";
    }
    heartbeatLease(issue.identifier, leaseNonce, LEASE_TTL_MS);

    const metricsProviderName = agentResult.providerName || provider.name;
    patchIssueState(issue.identifier, {
      notes: { ...currentState.notes, lastProvider: metricsProviderName },
    });

    if (!agentResult.completed) {
      const failureKind = classifyProviderFailure(
        `${agentResult.summary} ${agentResult.error || ""}`,
      );
      const failureMsg = agentResult.error || agentResult.summary || "Unknown failure";

      if (failureKind === "local_busy") {
        const cooldownMs = 2 * 60 * 1000; // Short cooldown for local busy
        await updateIssue(issue.id, { stateId: STATES.todo });
        setCooldown(issue.identifier, cooldownMs, "local_busy");

        // Record retry event for evidence
        recordRetryEvent(issue.identifier, {
          type: "failure",
          provider: metricsProviderName,
          reason: "local_busy",
          cooldown_ms: cooldownMs,
          error: failureMsg.slice(0, 200),
        });

        await addComment(
          issue.id,
          `⏳ **Local model busy** — returned to Todo with short cooldown.\n\nError: ${failureMsg.slice(0, 500)}`,
        );
        recordTransition(issue.identifier, {
          actor: "runner",
          reason: "local_busy",
          from: "In Progress",
          to: "Todo",
          runId: RUN_ID,
        });
        recordLinearCompletion(metricsProviderName, {
          completed: false,
          priority: issue.priority,
          estimate: issue.estimate,
        });
        return "done";
      }

      // Provider failures, stream errors, and gateway errors are now handled entirely by the bridge
      // The bridge tries ALL providers (no limit) until success or all providers exhausted
      // No runner-side retry logic needed - bridge handles fallback automatically
      if (
        failureKind === "provider" ||
        failureKind === "stream_error" ||
        failureKind === "gateway_error"
      ) {
        // Bridge handles all retries - just record the failure and let it propagate
        await addComment(
          issue.id,
          `⚠️ **Bridge failure** - all providers exhausted or bridge error: ${failureMsg.slice(0, 500)}`,
        );
        recordLinearCompletion(metricsProviderName, {
          completed: false,
          priority: issue.priority,
          estimate: issue.estimate,
        });
        // Move to Backlog (not Todo) - bridge already tried all providers, no more retries possible
        await updateIssue(issue.id, { stateId: STATES.backlog });
        return "done";
      }

      // Handle quota/rate-limit failures with exponential backoff (longer base)
      if (failureKind === "quota") {
        const currentState = getIssueState(issue.identifier);
        // Use longer base for quota failures (15min base instead of 10min)
        const cooldownMs = calculateExponentialBackoff(
          currentState.retry_count || 0,
          15 * 60 * 1000,
        );

        await updateIssue(issue.id, { stateId: STATES.todo });
        setCooldown(issue.identifier, cooldownMs, "quota_exhausted");

        // Record retry event for evidence
        recordRetryEvent(issue.identifier, {
          type: "failure",
          provider: metricsProviderName,
          reason: "quota_exhausted",
          cooldown_ms: cooldownMs,
          error: failureMsg.slice(0, 200),
        });

        await addComment(
          issue.id,
          `🚫 **Quota exhausted** — returned to Todo with exponential backoff (${Math.round(cooldownMs / 60000)}min).\n\nAttempt: ${attempt}/${RUNNER_MAX_RETRIES}\nError: ${failureMsg.slice(0, 500)}`,
        );
        recordTransition(issue.identifier, {
          actor: "runner",
          reason: "quota_exhausted",
          from: "In Progress",
          to: "Todo",
          runId: RUN_ID,
        });
        recordLinearCompletion(metricsProviderName, {
          completed: false,
          priority: issue.priority,
          estimate: issue.estimate,
        });
        return "done";
      }

      // Handle other failures with exponential backoff
      if (failureKind === "other") {
        const currentState = getIssueState(issue.identifier);
        const cooldownMs = calculateExponentialBackoff(currentState.retry_count || 0);

        await updateIssue(issue.id, { stateId: STATES.todo });
        setCooldown(issue.identifier, cooldownMs, "other_failure");

        // Record retry event for evidence
        recordRetryEvent(issue.identifier, {
          type: "failure",
          provider: metricsProviderName,
          reason: "other_failure",
          cooldown_ms: cooldownMs,
          error: failureMsg.slice(0, 200),
        });

        await addComment(
          issue.id,
          `⚠️ **Execution failed** — returned to Todo with exponential backoff (${Math.round(cooldownMs / 60000)}min).\n\nAttempt: ${attempt}/${RUNNER_MAX_RETRIES}\nError: ${failureMsg.slice(0, 500)}`,
        );
        recordTransition(issue.identifier, {
          actor: "runner",
          reason: "other_failure",
          from: "In Progress",
          to: "Todo",
          runId: RUN_ID,
        });
        recordLinearCompletion(metricsProviderName, {
          completed: false,
          priority: issue.priority,
          estimate: issue.estimate,
        });
        return "done";
      }
    }

    if (!agentResult) {
      setCooldown(issue.identifier, RUNNER_ISSUE_COOLDOWN_MS, "symphony_unavailable");
      await updateIssue(issue.id, { stateId: STATES.todo });
      await addComment(
        issue.id,
        `❌ **Symphony bridge unavailable**. Returned to Todo with cooldown.`,
      );
      recordTransition(issue.identifier, {
        actor: "runner",
        reason: "symphony_unavailable",
        from: "In Progress",
        to: "Todo",
        runId: RUN_ID,
      });
      return "done";
    }
    let changedFiles = gitDiffNames();
    if (changedFiles.length === 0) {
      // Check if agent needs continuation (has active subgoals)
      const needsContinuation = agentResult.needsContinuation === true;

      // Deterministic external completion check: re-check Linear API state after execution
      // (human or another process may have resolved it during agent execution)
      const postDetail = await getIssueDetail(issue.id);
      const isExternallyCompleted =
        postDetail?.state?.name === "Done" || postDetail?.state?.name === "Canceled";

      // If agent needs continuation with active subgoals, continue the work
      // instead of returning to Todo for a fresh start
      if (needsContinuation && agentResult.messages && agentResult.messages.length > 0) {
        logInfo(`[runner] 🔄 Agent has active subgoals - continuing with previous session...`);
        const contRemainingMs = getRemainingMs();
        if (contRemainingMs <= 0) {
          logWarn(`[runner] Wall-clock budget exhausted before continuation — aborting`);
          setCooldown(
            issue.identifier,
            RUNNER_ISSUE_COOLDOWN_MS,
            "wall_clock_exhausted",
            "wall_clock_exhausted",
          );
          await updateIssue(issue.id, { stateId: STATES.todo });
          await addComment(
            issue.id,
            `⏰ **Wall-clock budget exhausted** before continuation — returned to Todo.`,
          );
          recordTransition(issue.identifier, {
            actor: "runner",
            reason: "wall_clock_exhausted",
            from: "In Progress",
            to: "Todo",
            runId: RUN_ID,
          });
          recordLinearCompletion(provider.name, {
            completed: false,
            priority: issue.priority,
            estimate: issue.estimate,
          });
          return "done";
        }
        heartbeatLease(issue.identifier, leaseNonce, LEASE_TTL_MS);

        try {
          const continueResult = await continueAgent({
            provider,
            messages: agentResult.messages,
            projectRoot: ROOT,
            worktreeId: WORKTREE_ID,
            worktreeRoot: ROOT,
            leaseId: leaseNonce,
            executionMode: "mutating",
            feedback:
              "Continue working on the active subgoals. Complete the remaining tasks and call task_complete when done. Make sure to run run_typecheck, run_lint, run_cspell, run_ast_density, and run_tests before calling task_complete.",
            maxTurns: RUNNER_MAX_TURNS,
            maxMs: contRemainingMs,
          });
          agentResult = continueResult;
          changedFiles = gitDiffNames();
        } catch (err) {
          logError(`[runner] Continuation failed: ${err.message}`);
          // Fall through to handle as no changes
        }

        // Lease check after continuation
        if (!leaseValid) {
          logWarn(`[runner] Lease lost during continuation of ${issue.identifier} — aborting`);
          gitRevert();
          recordTransition(issue.identifier, {
            actor: "runner",
            reason: "lease_lost",
            from: "In Progress",
            to: "Todo",
            runId: RUN_ID,
          });
          try {
            await updateIssue(issue.id, { stateId: STATES.todo });
            await addComment(
              issue.id,
              `⚠️ **Run abandoned** — lease lost during agent continuation. Changes reverted. No successful completion occurred.\n\nRun: ${RUN_ID}\nWorktree: ${WORKTREE_ID}`,
            );
          } catch (wbErr) { logWarn(`[runner] Abandonment writeback failed: ${wbErr.message}`); }
          sendDiscordEmbed({
            title: `⚠️ Abandoned | ${WORKTREE_ID}`,
            description: `${issue.identifier}: ${issue.title}`,
            color: 0xff0000,
            fields: [
              { name: "Reason", value: "Lease lost during continuation", inline: true },
              { name: "Worktree", value: WORKTREE_ID, inline: true },
            ],
          }).catch(() => {});
          recordLinearCompletion(metricsProviderName, {
            completed: false,
            priority: issue.priority,
            estimate: issue.estimate,
          });
          return "done";
        }

        // Check result after continuation
        if (changedFiles.length > 0) {
          // Continuation produced changes - proceed to validation
          logInfo(`[runner] ✅ Continuation produced changes: ${changedFiles.length} files`);
        } else if (agentResult.needsContinuation) {
          // Still needs continuation — fingerprint and possibly quarantine
          {
            const contSignature = "continuation_exhausted";
            if (priorFailureSignature === contSignature) {
              markRetryExhausted(issue.identifier, {
                reason: "continuation_exhausted_repeated",
                signature: contSignature,
              });
              await updateIssue(issue.id, { stateId: STATES.backlog });
              await addComment(
                issue.id,
                `🚫 **Continuation exhausted (repeated)** — same failure fingerprint. Moved to Backlog.`,
              );
              recordTransition(issue.identifier, {
                actor: "runner",
                reason: "continuation_exhausted_repeated",
                from: "In Progress",
                to: "Backlog",
                runId: RUN_ID,
              });
            } else {
              setCooldown(
                issue.identifier,
                RUNNER_ISSUE_COOLDOWN_MS,
                "continuation_exhausted",
                contSignature,
              );
              await updateIssue(issue.id, { stateId: STATES.todo });
              await addComment(
                issue.id,
                `🔄 **Continuation exhausted** — agent still has active subgoals after second attempt. Returned to Todo with cooldown.`,
              );
              recordTransition(issue.identifier, {
                actor: "runner",
                reason: "continuation_exhausted",
                from: "In Progress",
                to: "Todo",
                runId: RUN_ID,
              });
            }
          }
          logWarn(`[runner] 🔄 Continuation exhausted: ${issue.identifier}`);
          // Track continuation exhausted as failure
          if (provider?.name) {
            recordLinearCompletion(provider.name, {
              completed: false,
              priority: issue.priority,
              estimate: issue.estimate,
            });
          }
          return "done";
        }
      }

      // Document external completion in a log file for audit trail
      const externalLogPath = resolve(ROOT, "reports", "symphony", "external-completions.log");
      const externalLogEntry = `[${new Date().toISOString()}] ${issue.identifier}: ${issue.title}\n  Agent: ${agentResult.summary?.slice(0, 200)}\n  Externally completed: ${isExternallyCompleted}\n  Agent completed: ${agentResult.completed}\n`;
      try {
        const dir = resolve(ROOT, "reports", "symphony");
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        appendFileSync(externalLogPath, externalLogEntry);
      } catch {
        /* best effort logging */
      }

      // No-file-change completion hardening: require explicit evidence before accepting
      if (agentResult.completed === true && !isExternallyCompleted) {
        if (agentResult.toolCalls > 0) {
          // Agent did real work (tool calls) but produced no file changes — needs human review
          await updateIssue(issue.id, { stateId: STATES.inReview });
          await addComment(
            issue.id,
            `ℹ️ **Agent completed with no file changes** — moved to In Review for human verification.\n\nTool calls: ${agentResult.toolCalls}\nAgent summary: ${agentResult.summary}`,
          );
          recordTransition(issue.identifier, {
            actor: "runner",
            reason: "agent_completed_no_changes_review",
            from: "In Progress",
            to: "In Review",
            runId: RUN_ID,
          });
        } else {
          // Agent reported completion with zero tool calls and zero file changes — false positive
          await updateIssue(issue.id, { stateId: STATES.todo });
          await addComment(
            issue.id,
            `⚠️ **Agent reported completion with no file changes and no tool calls** — returned to Todo. Likely inferred false positive.\n\nAgent summary: ${agentResult.summary}`,
          );
          recordTransition(issue.identifier, {
            actor: "runner",
            reason: "agent_completed_no_evidence",
            from: "In Progress",
            to: "Todo",
            runId: RUN_ID,
          });
        }
        if (provider?.name) {
          recordLinearCompletion(metricsProviderName, {
            completed: false,
            priority: issue.priority,
            estimate: issue.estimate,
          });
        }
        logInfo(
          `[runner] ⚠️ No-change completion: ${issue.identifier} — ${issue.title} (requires review)`,
        );
        return "done";
      }

      if (isExternallyCompleted) {
        // Issue was completed externally (by human or another process) - move to Done
        await updateIssue(issue.id, { stateId: STATES.done });
        await addComment(
          issue.id,
          `✅ **Completed externally** — no file changes detected, but issue was resolved externally (by human or another process). Marked as Done.`,
        );
        recordTransition(issue.identifier, {
          actor: "runner",
          reason: "completed_externally",
          from: "In Progress",
          to: "Done",
          runId: RUN_ID,
        });
        // Track Linear issue completion (externally completed - issue was resolved one way or another)
        if (provider?.name) {
          recordLinearCompletion(metricsProviderName, {
            completed: true,
            priority: issue.priority,
            estimate: issue.estimate,
          });
          recordProviderSuccess(metricsProviderName);
        }
        // Clear any cooldown so it doesn't get re-queued
        clearCooldown(issue.identifier);
        logInfo(`[runner] ✅ Completed: ${issue.identifier} — ${issue.title} (externally)`);
        return "done";
      }

      // Note: needsContinuation is now handled above with continueAgent call
      // This block is kept as fallback for cases where messages weren't available
      if (agentResult.needsContinuation === true && !agentResult.messages) {
        // No messages available for continuation - return to Todo
        await addComment(
          issue.id,
          `🔄 **Agent continuing work** — active subgoals detected (no prior messages available for continuation).\n\n${agentResult.summary}`,
        );
        clearCooldown(issue.identifier);
        await updateIssue(issue.id, { stateId: STATES.todo });
        recordTransition(issue.identifier, {
          actor: "runner",
          reason: "active_subgoals_no_messages",
          from: "In Progress",
          to: "Todo",
          runId: RUN_ID,
        });
        logInfo(
          `[runner] 🔄 Continuing (no messages): ${issue.identifier} — ${issue.title} (active subgoals)`,
        );
        // Track active subgoals without messages as failure
        if (provider?.name) {
          recordLinearCompletion(metricsProviderName, {
            completed: false,
            priority: issue.priority,
            estimate: issue.estimate,
          });
        }
        return "done";
      }

      // Generalized failure fingerprinting: quarantine if same signature repeats
      {
        const nfcSignature = "no_file_changes";
        if (priorFailureSignature === nfcSignature) {
          await updateIssue(issue.id, { stateId: STATES.backlog });
          markRetryExhausted(issue.identifier, {
            reason: "no_file_changes_repeated",
            signature: nfcSignature,
          });
          await addComment(
            issue.id,
            `🚫 **No file changes produced (repeated)** — same failure fingerprint. Moved to Backlog and blocked from automatic retry.\n\nAgent summary: ${agentResult.summary}`,
          );
          recordTransition(issue.identifier, {
            actor: "runner",
            reason: "no_file_changes_repeated",
            from: "In Progress",
            to: "Backlog",
            runId: RUN_ID,
          });
        } else {
          setCooldown(issue.identifier, RUNNER_ISSUE_COOLDOWN_MS, "no_file_changes", nfcSignature);
          await updateIssue(issue.id, { stateId: STATES.todo });
          await addComment(
            issue.id,
            `⚠️ **No file changes produced** — returned to Todo with cooldown for manual review.\n\nAgent summary: ${agentResult.summary}`,
          );
          recordTransition(issue.identifier, {
            actor: "runner",
            reason: "no_file_changes",
            from: "In Progress",
            to: "Todo",
            runId: RUN_ID,
          });
        }
      }
      // Track failure (no files changed = failed)
      recordLinearCompletion(metricsProviderName, {
        completed: false,
        priority: issue.priority,
        estimate: issue.estimate,
      });
      return "done";
    }

    // Rebase uncommitted work onto latest main before validation without creating merge commits.
    // This keeps each worktree isolated while ensuring validation runs against current shared git state.
    if (WORKTREE_ID !== "main") {
      const syncResult = syncWorktreeBeforeValidation(changedFiles);
      if (syncResult.ok) {
        logInfo(`[runner] Pre-validation sync: replayed local changes onto latest origin/main`);
      } else if (syncResult.conflictDetected) {
        const conflictSignature = "merge_conflict_before_validation";
        if (priorFailureSignature === conflictSignature) {
          markRetryExhausted(issue.identifier, {
            reason: "merge_conflict_repeated",
            signature: conflictSignature,
          });
          await updateIssue(issue.id, { stateId: STATES.backlog });
          await addComment(
            issue.id,
            `🚫 **Merge conflict with main (repeated)** — another worktree's changes conflict with this work. Moved to Backlog for manual review.`,
          );
          recordTransition(issue.identifier, {
            actor: "runner",
            reason: "merge_conflict_repeated",
            from: "In Progress",
            to: "Backlog",
            runId: RUN_ID,
          });
        } else {
          setCooldown(
            issue.identifier,
            RUNNER_ISSUE_COOLDOWN_MS,
            "merge_conflict_before_validation",
            conflictSignature,
          );
          await updateIssue(issue.id, { stateId: STATES.todo });
          await addComment(
            issue.id,
            `⚠️ **Merge conflict with main** — another worktree completed conflicting changes. Returned to Todo with cooldown.`,
          );
          recordTransition(issue.identifier, {
            actor: "runner",
            reason: "merge_conflict_before_validation",
            from: "In Progress",
            to: "Todo",
            runId: RUN_ID,
          });
        }
        recordLinearCompletion(metricsProviderName, {
          completed: false,
          priority: issue.priority,
          estimate: issue.estimate,
        });
        return "done";
      } else {
        logWarn(`[runner] Pre-validation sync failed (non-fatal): ${syncResult.error.message}`);
        // Continue with validation using the restored working tree state.
      }
    }

    // Create heartbeat callback for validation steps
    const validationHeartbeat = () => {
      const hb = heartbeatLease(issue.identifier, leaseNonce, LEASE_TTL_MS);
      if (!hb.ok) {
        logWarn(
          `[runner] Validation heartbeat failed for ${issue.identifier}: ${hb.reason} — marking lease lost`,
        );
        leaseValid = false;
      }
      return hb;
    };

    let validation = await runValidation(ROOT, changedFiles, { heartbeat: validationHeartbeat });
    let validationFixAttempts = 0;
    let previousSignature = validation.signature;

    // Check if validation failed due to heartbeat failure
    if (validation.heartbeatFailed) {
      const hbDetail = validation.heartbeatDetail;
      const hbReason = hbDetail?.reason || "unknown";
      logWarn(
        `[runner] Validation aborted due to heartbeat failure for ${issue.identifier}: ${hbReason} (phase=${hbDetail?.phase}, elapsed=${hbDetail?.elapsedMs}ms)`,
      );
      gitRevert();
      recordTransition(issue.identifier, {
        actor: "runner",
        reason: `lease_lost_during_validation:${hbReason}`,
        from: "In Progress",
        to: "Todo",
        runId: RUN_ID,
      });
      try {
        await updateIssue(issue.id, { stateId: STATES.todo });
        await addComment(
          issue.id,
          `⚠️ **Run abandoned** — lease lost during validation (${hbReason}). Changes reverted. No successful completion occurred.\n\nPhase: ${hbDetail?.phase || "unknown"}\nElapsed: ${hbDetail?.elapsedMs || "unknown"}ms\nRun: ${RUN_ID}\nWorktree: ${WORKTREE_ID}`,
        );
      } catch (wbErr) { logWarn(`[runner] Abandonment writeback failed: ${wbErr.message}`); }
      sendDiscordEmbed({
        title: `⚠️ Abandoned | ${WORKTREE_ID}`,
        description: `${issue.identifier}: ${issue.title}`,
        color: 0xff0000,
        fields: [
          { name: "Reason", value: `Lease lost during validation: ${hbReason}`, inline: true },
          { name: "Worktree", value: WORKTREE_ID, inline: true },
        ],
      }).catch(() => {});
      recordLinearCompletion(metricsProviderName, {
        completed: false,
        priority: issue.priority,
        estimate: issue.estimate,
      });
      return "done";
    }

    while (!validation.passed && validationFixAttempts < RUNNER_MAX_VALIDATION_FIXES) {
      // Wall-clock + lease check before each validation fix attempt
      const fixRemainingMs = getRemainingMs();
      if (fixRemainingMs <= 0 || !leaseValid) {
        logWarn(
          `[runner] ${!leaseValid ? "Lease lost" : "Wall-clock exhausted"} during validation fixes — breaking`,
        );
        break;
      }
      validationFixAttempts += 1;
      const feedback = formatValidationFeedback(validation);
      const fixResult = await continueAgent({
        provider,
        messages: agentResult.messages,
        projectRoot: ROOT,
        worktreeId: WORKTREE_ID,
        worktreeRoot: ROOT,
        leaseId: leaseNonce,
        executionMode: "mutating",
        feedback,
        maxTurns: RUNNER_VALIDATION_FIX_TURNS,
        maxMs: Math.min(RUNNER_VALIDATION_FIX_TURNS * 15_000, fixRemainingMs),
      });
      agentResult.turns += fixResult.turns;
      agentResult.toolCalls += fixResult.toolCalls;
      agentResult.messages = fixResult.messages;
      if (fixResult.error || fixResult.turns === 0) break;
      changedFiles = gitDiffNames();
      if (changedFiles.length === 0) break;
      const nextValidation = await runValidation(ROOT, changedFiles, {
        heartbeat: validationHeartbeat,
      });

      // Check if validation failed due to heartbeat failure
      if (nextValidation.heartbeatFailed) {
        logWarn(`[runner] Validation fix aborted due to heartbeat failure for ${issue.identifier}`);
        leaseValid = false;
        break;
      }

      const sameSignature =
        nextValidation.signature && nextValidation.signature === previousSignature;
      validation = nextValidation;
      if (sameSignature) break;
      previousSignature = validation.signature;
    }

    // Lease check after validation fixes
    if (!leaseValid) {
      logWarn(`[runner] Lease lost during validation fixes of ${issue.identifier} — aborting`);
      gitRevert();
      recordTransition(issue.identifier, {
        actor: "runner",
        reason: "lease_lost",
        from: "In Progress",
        to: "Todo",
        runId: RUN_ID,
      });
      try {
        await updateIssue(issue.id, { stateId: STATES.todo });
        await addComment(
          issue.id,
          `⚠️ **Run abandoned** — lease lost during validation fixes. Changes reverted. No successful completion occurred.\n\nRun: ${RUN_ID}\nWorktree: ${WORKTREE_ID}`,
        );
      } catch (wbErr) { logWarn(`[runner] Abandonment writeback failed: ${wbErr.message}`); }
      sendDiscordEmbed({
        title: `⚠️ Abandoned | ${WORKTREE_ID}`,
        description: `${issue.identifier}: ${issue.title}`,
        color: 0xff0000,
        fields: [
          { name: "Reason", value: "Lease lost during validation fixes", inline: true },
          { name: "Worktree", value: WORKTREE_ID, inline: true },
        ],
      }).catch(() => {});
      recordLinearCompletion(metricsProviderName, {
        completed: false,
        priority: issue.priority,
        estimate: issue.estimate,
      });
      return "done";
    }

    if (!validation.passed) {
      // Phase 2: Check if we should preserve dirty tree for same-worktree repair
      const valFinalization = getFinalizationState(issue.identifier);
      const valRepairAttempts =
        (valFinalization?.state === "validation_failed_repairable"
          ? valFinalization.attempts || 0
          : 0) + 1;
      const valSignature = `validation_failed:${validation.signature || "unknown"}`;
      const isRepeatedValSignature = priorFailureSignature === valSignature;

      if (
        valRepairAttempts <= RUNNER_VALIDATION_REPAIR_MAX &&
        attempt < RUNNER_MAX_RETRIES &&
        !isRepeatedValSignature
      ) {
        // Preserve dirty tree for same-worktree repair
        const validationErrors = validation.results
          .filter((r) => !r.pass)
          .map((r) => `### ${r.check}\n${String(r.detail).slice(0, 2000)}\n`)
          .join("\n");

        // Write full validation output to sidecar file for next repair cycle
        const sidecarPath = resolve(ROOT, ".git", "SYMPHONY_VALIDATION_ERRORS");
        try {
          writeFileSync(sidecarPath, validationErrors, "utf-8");
        } catch {
          /* best effort */
        }

        setFinalizationState(issue.identifier, {
          state: "validation_failed_repairable",
          worktreeId: WORKTREE_ID,
          stickyOwner: WORKTREE_ID,
          lastError: validationErrors.slice(0, 500),
          attempts: valRepairAttempts,
        });
        setWorktreeState(WORKTREE_ID, { state: "dirty_owned", issueIdentifier: issue.identifier });
        await updateIssue(issue.id, { stateId: STATES.inReview });
        await addComment(
          issue.id,
          `❌ **Validation failed** (repair ${valRepairAttempts}/${RUNNER_VALIDATION_REPAIR_MAX}) — preserving dirty tree for same-worktree repair.\n\n${validationErrors.slice(0, 1500)}`,
        );
        recordTransition(issue.identifier, {
          actor: "runner",
          reason: "validation_failed_repairable",
          from: "In Progress",
          to: "In Review",
          runId: RUN_ID,
        });
        recordLinearCompletion(metricsProviderName, {
          completed: false,
          priority: issue.priority,
          estimate: issue.estimate,
        });
        return "done";
      }

      // Threshold exceeded or repeated signature — revert and quarantine
      gitRevert();
      if (attempt >= RUNNER_MAX_RETRIES) {
        await updateIssue(issue.id, { stateId: STATES.backlog });
        markRetryExhausted(issue.identifier, {
          reason: "validation_failed",
          signature: validation.signature,
        });
        await addComment(
          issue.id,
          `❌ **Validation failed** after ${validationFixAttempts} fix attempt(s). Moved to Backlog and blocked from automatic retry.\n\n${validation.results
            .filter((r) => !r.pass)
            .map(
              (r) => `### ${r.check}\n\
${String(r.detail).slice(0, 1000)}\n`,
            )
            .join("\n")}`,
        );
        recordTransition(issue.identifier, {
          actor: "runner",
          reason: "validation_failed_exhausted",
          from: "In Progress",
          to: "Backlog",
          runId: RUN_ID,
        });
        recordLinearCompletion(metricsProviderName, {
          completed: false,
          priority: issue.priority,
          estimate: issue.estimate,
        });
      } else if (isRepeatedValSignature) {
        await updateIssue(issue.id, { stateId: STATES.backlog });
        markRetryExhausted(issue.identifier, {
          reason: "validation_failed_repeated",
          signature: valSignature,
        });
        await addComment(
          issue.id,
          `🚫 **Validation failed (repeated same signature)** after ${validationFixAttempts} fix attempt(s). Quarantined to Backlog.\n\n${validation.results
            .filter((r) => !r.pass)
            .map((r) => `### ${r.check}\n${String(r.detail).slice(0, 1000)}\n`)
            .join("\n")}`,
        );
        recordTransition(issue.identifier, {
          actor: "runner",
          reason: "validation_failed_repeated",
          from: "In Progress",
          to: "Backlog",
          runId: RUN_ID,
        });
        recordLinearCompletion(metricsProviderName, {
          completed: false,
          priority: issue.priority,
          estimate: issue.estimate,
        });
      } else {
        setCooldown(issue.identifier, RUNNER_ISSUE_COOLDOWN_MS, "validation_failed", valSignature);
        await updateIssue(issue.id, { stateId: STATES.todo });
        await addComment(
          issue.id,
          `❌ **Validation failed** after ${validationFixAttempts} fix attempt(s). Returned to Todo with cooldown.\n\n${validation.results
            .filter((r) => !r.pass)
            .map(
              (r) => `### ${r.check}\n\
${String(r.detail).slice(0, 1000)}\n`,
            )
            .join("\n")}`,
        );
        recordTransition(issue.identifier, {
          actor: "runner",
          reason: "validation_failed_retryable",
          from: "In Progress",
          to: "Todo",
          runId: RUN_ID,
        });
        recordLinearCompletion(metricsProviderName, {
          completed: false,
          priority: issue.priority,
          estimate: issue.estimate,
        });
      }
      return "done";
    }

    const diffStat = gitDiffStat();
    if (!gitCommit(issue.identifier, issue.title, agentResult.summary, changedFiles)) {
      const priorFinalization = getFinalizationState(issue.identifier);
      const commitAttempts = (priorFinalization?.attempts || 0) + 1;
      if (commitAttempts > 3) {
        gitRevert();
        await setFinalizationState(issue.identifier, {
          state: "commit_failed_blocked",
          worktreeId: WORKTREE_ID,
          stickyOwner: WORKTREE_ID,
          lastError: "git commit failed repeatedly",
          attempts: commitAttempts,
          updatedAt: new Date().toISOString(),
        });
        await updateIssue(issue.id, { stateId: STATES.backlog });
        await addComment(
          issue.id,
          "🚫 **Git commit failed (blocked)** — exceeded repair threshold. Moved to Backlog.",
        );
        recordTransition(issue.identifier, {
          actor: "runner",
          reason: "commit_failed_blocked",
          from: "In Progress",
          to: "Backlog",
          runId: RUN_ID,
        });
      } else {
        await setFinalizationState(issue.identifier, {
          state: "commit_failed_repairable",
          worktreeId: WORKTREE_ID,
          stickyOwner: WORKTREE_ID,
          branch: currentBranchNameForRunner(),
          headSha: getRepoHeadSha("HEAD"),
          lastError: "git commit failed during finalization",
          attempts: commitAttempts,
          updatedAt: new Date().toISOString(),
        });
        await updateIssue(issue.id, { stateId: STATES.inReview });
        await addComment(
          issue.id,
          "❌ Git commit failed during finalization. Assigned back to same worktree for repair.",
        );
        recordTransition(issue.identifier, {
          actor: "runner",
          reason: "commit_failed_repairable",
          from: "In Progress",
          to: "In Review",
          runId: RUN_ID,
        });
      }
      recordLinearCompletion(metricsProviderName, {
        completed: false,
        priority: issue.priority,
        estimate: issue.estimate,
      });
      return "done";
    }

    let finalStateId = STATES.inReview;
    let finalStateName = "In Review";
    let branchPush = { ok: false };
    if (RUNNER_AUTO_PUSH) {
      branchPush = await gitPushWorktreeBranch();
      if (branchPush.ok) {
        await setFinalizationState(issue.identifier, {
          state: "integration_pending",
          worktreeId: WORKTREE_ID,
          branch: branchPush.branch,
          baseMainSha: getRepoHeadSha("origin/main"),
          headSha: branchPush.head,
          attempts: 0,
          stickyOwner: WORKTREE_ID,
          lastError: null,
          updatedAt: new Date().toISOString(),
        });
        await enqueueIntegrationCandidate(issue.identifier);
      } else {
        await setFinalizationState(issue.identifier, {
          state: "branch_push_failed_repairable",
          worktreeId: WORKTREE_ID,
          stickyOwner: WORKTREE_ID,
          branch: branchPush.branch,
          headSha: branchPush.head,
          lastError: branchPush.error || "push failed",
          attempts: 1,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    const completionComment = [
      `✅ **Symphony agent completed** (Attempt ${attempt}/${RUNNER_MAX_RETRIES})`,
      "",
      `**Run:** ${RUN_ID}`,
      `**Gateway:** ${provider.name} (${provider.model})`,
      `**Routed provider:** ${metricsProviderName}`,
      `**Turns:** ${agentResult.turns}`,
      `**Tool calls:** ${agentResult.toolCalls}`,
      `**Files changed:** ${changedFiles.length}`,
      `**Validation fix attempts:** ${validationFixAttempts}`,
      `**Finalization state:** ${branchPush.ok ? "integration_pending" : "local_commit_complete"}`,
      `**Branch:** ${branchPush.branch || "N/A"}`,
      `**Commit:** ${getRepoHeadSha("HEAD").slice(0, 8)}`,
      "",
      "### Agent Summary",
      agentResult.summary,
      "",
      "### Diff",
      "```",
      diffStat || "(no diff stat)",
      "```",
      "",
      "### Validation",
      ...validation.results.map((r) => `- ${r.pass ? "✅" : "❌"} ${r.check}`),
    ].join("\n");

    await addComment(issue.id, completionComment);

    const commitHash = execFileSync("git", ["rev-parse", "--short", "HEAD"], {
      cwd: ROOT,
      encoding: "utf-8",
    }).trim();

    await runSonarPostCommit(issue.identifier);
    await updateIssue(issue.id, { stateId: finalStateId });

    // Record completion with latency tracking
    const latencyMs = Date.now() - issueStartMs;
    recordCompletion(issue.identifier, {
      latencyMs,
      completedAt: new Date().toISOString(),
    });

    recordTransition(issue.identifier, {
      actor: "runner",
      reason: branchPush.ok ? "integration_pending" : "local_commit_complete",
      from: "In Progress",
      to: finalStateName,
      runId: RUN_ID,
    });

    // Track Linear issue completion (success = done state)
    {
      const isDone = finalStateId === STATES.done;
      recordLinearCompletion(metricsProviderName, {
        completed: isDone,
        priority: issue.priority,
        estimate: issue.estimate,
      });
      if (isDone) {
        recordProviderSuccess(metricsProviderName);
      }
    }

    // Log completion with issue context
    logInfo(`[runner] ✅ Completed: ${issue.identifier} — ${issue.title}`);

    if (!RUNNER_AUTO_PUSH) {
      await addComment(
        issue.id,
        "ℹ️ **Auto-push disabled** — leaving issue In Review. Integrator will promote to main.",
      );
    } else if (!branchPush.ok) {
      await addComment(
        issue.id,
        "⚠️ **Branch push failed** — commit exists locally but push to worktree branch failed. Assigned to same worktree for repair.",
      );
    }

    // Send consolidated Discord notification AFTER all Linear writeback is complete
    const queueSnap = await getQueueSnapshot();
    const activeRunners = queueSnap.inProgress.automatable.length;
    const maxRunners = MAX_CONCURRENT_AGENTS;
    const worktreeValue = `${WORKTREE_ID} (${activeRunners}/${maxRunners} active)`;
    const queueValue = `${queueSnap.readyDepth} issues ready`;

    sendDiscordEmbed({
      title: `${issue.identifier} | ${WORKTREE_ID}`,
      description: issue.title,
      color: finalStateId === STATES.done ? 0x00ff00 : 0xffa500,
      fields: [
        { name: "ANQ ID", value: issue.identifier, inline: true },
        { name: "Worktree", value: worktreeValue, inline: true },
        { name: "Status", value: finalStateName, inline: true },
        { name: "Provider", value: metricsProviderName, inline: true },
        { name: "Queue", value: queueValue, inline: true },
        { name: "Files Changed", value: String(changedFiles.length), inline: true },
        { name: "Turns", value: String(agentResult.turns), inline: true },
        { name: "Validation", value: validation.passed ? "✅ Passed" : "❌ Failed", inline: true },
        { name: "Commit", value: commitHash || "N/A", inline: true },
      ],
    }).catch((err) => logWarn(`Discord notification failed: ${err.message}`));

    return "done";
  } finally {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    releaseLease(issue.identifier, leaseNonce);
    // Phase 0: Reset worktree state unless marked dirty for repair
    const finalWtState = getWorktreeState(WORKTREE_ID);
    if (!finalWtState || finalWtState.state === "executing") {
      setWorktreeState(WORKTREE_ID, { state: "available", issueIdentifier: null });
    }
    // Clean up validation sidecar file on successful completion
    const sidecarCleanup = resolve(ROOT, ".git", "SYMPHONY_VALIDATION_ERRORS");
    try {
      if (existsSync(sidecarCleanup)) unlinkSync(sidecarCleanup);
    } catch {
      /* best effort */
    }
  }
}
