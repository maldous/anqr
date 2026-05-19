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
  transitionIssue,
  getFinalizationState,
  transitionWorktree,
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
import { writePreValidationPatch } from "./write-pre-validation-patch.mjs";
import { removeTempFile } from "./remove-temp-file.mjs";
import { gitMetadataPath } from "./git-path.mjs";
import { getQueueSnapshot } from "../../symphony-queue-control.mjs";
import { sendDiscordEmbed } from "../../integrations/notifications/openclaw-discord.mjs";
import { voiceAnnounce } from "../../integrations/model/symphony-openai-bridge/voice-announce.mjs";
import {
  recordExecutionResult,
  recordValidationResult,
  recordPushResult,
} from "../../core/task-evidence.mjs";

import { LEASE_TTL_MS } from "./lease-ttl-ms.mjs";
import { ROOT } from "./root.mjs";
import { RUN_ID } from "./run-id.mjs";
import { SYNC_FAILURE_THRESHOLD } from "./sync-failure-threshold.mjs";
import { SYNC_FAIL_COUNT_FILE } from "./sync-fail-count-file.mjs";
import { WORKFLOW_PATH } from "./workflow-path.mjs";
import { WORKTREE_ID } from "./worktree-id.mjs";
import { classifyProviderFailure } from "./classify-provider-failure.mjs";
import { safetyCap } from "../../lib/safety-cap.mjs";
import { currentBranchNameForRunner } from "./current-branch-name-for-runner.mjs";
import { getRepoHeadSha } from "./get-repo-head-sha.mjs";
import { getRunnerProvider } from "./get-runner-provider.mjs";
import { gitCommit } from "./git-commit.mjs";
import { gitDiffNames } from "./git-diff-names.mjs";
import { getWorkingTreeStatus } from "./get-working-tree-status.mjs";
import { gitDiffStat } from "./git-diff-stat.mjs";
import { gitPushWorktreeBranch } from "./git-push-worktree-branch.mjs";
import { gitRevert } from "./git-revert.mjs";
import { releaseLock } from "./release-lock.mjs";
import { runSonarPostCommit } from "./run-sonar-post-commit.mjs";
import { syncFailCount, setSyncFailCount } from "./sync-fail-count.mjs";
import { syncWorktreeBeforeValidation } from "./sync-worktree-before-validation.mjs";
import { logInfo, logWarn, logError, logDebug } from "./logger.mjs";

export async function executeIssue(issue, dryRun = false, { operatorOverride = false } = {}) {
  const correlationId = process.env.ANQR_CORRELATION_ID || null;

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

  // ADR-0002: Verify worktree assignment — refuse execution if the scheduler
  // assigned this issue to a different worktree. This is the executor-side
  // enforcement of scheduler authority (end-to-end assignment verification).
  // Skipped for: repair candidates (validated at pick time by
  // getNextRepairableIssueForWorktree), operator overrides (--issue flag).
  if (!isRepairCandidate && !operatorOverride) {
    const preLeaseState = getIssueState(issue.identifier);
    if (
      preLeaseState?.assignment?.worktreeId &&
      preLeaseState.assignment.worktreeId !== WORKTREE_ID
    ) {
      logWarn(
        `[runner] ⛔ Assignment mismatch: ${issue.identifier} assigned to ${preLeaseState.assignment.worktreeId} but running on ${WORKTREE_ID} — refusing execution`,
      );
      return "skip";
    }
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

      // Use reset --hard instead of merge --ff-only: after cherry-pick integration the
      // worktree branch diverges from origin/main (same changes, different SHA) so
      // ff-only always fails. reset --hard is safe here because the working tree is
      // clean at this point (dirty-check happens above via getWorkingTreeStatus).
      logDebug(`[worktree-sync] Executing: git reset --hard origin/main (cwd: ${ROOT})`);
      execFileSync("git", ["reset", "--hard", "origin/main"], { cwd: ROOT, stdio: "pipe" });
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

      // Threshold reached — quarantine worktree for recovery service instead of destructive reset
      if (syncFailCount >= SYNC_FAILURE_THRESHOLD) {
        logWarn(
          `[runner] ⚠️ Sync failure threshold reached (${syncFailCount}/${SYNC_FAILURE_THRESHOLD})`,
        );
        logWarn(`[runner] Quarantining worktree ${WORKTREE_ID} for recovery service...`);

        transitionWorktree(WORKTREE_ID, "quarantined", {
          reason: "sync_failure_threshold",
          lastError: `syncFailCount: ${syncFailCount}, ${err.message}`,
          quarantinedAt: new Date().toISOString(),
        });

        // Reset counter so recovery service gets a clean slate
        setSyncFailCount(0);
        try {
          if (existsSync(SYNC_FAIL_COUNT_FILE)) {
            unlinkSync(SYNC_FAIL_COUNT_FILE);
          }
        } catch {}

        logInfo(`[runner] Worktree ${WORKTREE_ID} quarantined — recovery service will repair it.`);
        releaseLock();
        return "skip";
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

  // ── Per-run trace file init ───────────────────────────────────────────────
  process.env.ANQR_ISSUE_ID = issue.identifier;
  process.env.ANQR_RUN_ID = RUN_ID;
  process.env.ANQR_WORKTREE_ID = WORKTREE_ID;
  const { initRunTrace, traceLog, getTracePath } = await import("../../lib/run-trace.mjs");
  initRunTrace({ issueId: issue.identifier, runId: RUN_ID, worktreeId: WORKTREE_ID });
  logInfo(`[runner] Trace file: ${getTracePath() || "(not initialized)"}`);
  traceLog("START", "issue execution starting", {
    issueId: issue.identifier,
    issueTitle: issue.title,
    attempt,
    maxRetries: RUNNER_MAX_RETRIES,
    worktreeId: WORKTREE_ID,
    runId: RUN_ID,
    isRepairCandidate,
  });
  // ─────────────────────────────────────────────────────────────────────────

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
    // Phase 0: Set worktree state to executing.
    // Phase 4: The scheduler already sets the worktree to "executing" at claim
    // time. Skip if already in that state to avoid an invalid self-transition.
    // Still transition for non-executing states (e.g. dirty_owned for sticky repair).
    const currentWtState = getWorktreeState(WORKTREE_ID);
    if (!currentWtState || currentWtState.state !== "executing") {
      transitionWorktree(WORKTREE_ID, "executing", { assignedIssue: issue.identifier });
    }

    // Phase 2: Handle branch_push_failed_repairable — retry push before running agent
    if (isRepairCandidate && currentFinalization.state === "branch_push_failed_repairable") {
      logInfo(`[runner] 🔧 Retrying branch push for ${issue.identifier}...`);
      const retryPush = await gitPushWorktreeBranch();
      if (retryPush.ok) {
        transitionIssue(issue.identifier, "integration_pending", {
          finalization: {
            state: "integration_pending",
            branch: retryPush.branch,
            headSha: retryPush.head,
            baseMainSha: getRepoHeadSha("origin/main"),
            attempts: 0,
            lastError: null,
          },
          reason: "branch_push_retry_success",
        });
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
    voiceAnnounce(`Starting work on ${issue.identifier}: ${issue.title}.`);

    // NOTE: Discord notification removed from here to eliminate duplicate messages.
    // Only the final completion notification (below) is sent to Discord.

    let systemPrompt = "You are a coding agent. Implement the requested changes.";
    if (existsSync(WORKFLOW_PATH)) systemPrompt = readFileSync(WORKFLOW_PATH, "utf-8");

    // Inject no-action nudge when previous attempt made zero tool calls.
    // no_action_nudge: true  → inject prompt nudge then clear (consumed once)
    // no_action_done: true   → persistent flag: next no_action run → Done
    const preRunState = getIssueState(issue.identifier);
    if (preRunState.notes?.no_action_nudge) {
      systemPrompt += `\n\n## IMPORTANT: DO NOT PLAN\n\nThe previous attempt produced text only — no files were read or edited. This attempt must start with tool calls immediately. Do not write a plan or explain your approach. Read the files, find the lines, make the changes.`;
      patchIssueState(issue.identifier, {
        notes: { ...preRunState.notes, no_action_nudge: false, no_action_done: true },
      });
    }

    // Phase 2: Add repair context for repairable states
    if (isRepairCandidate) {
      if (currentFinalization.state === "validation_failed_repairable") {
        const sidecarPath = gitMetadataPath("SYMPHONY_VALIDATION_ERRORS");
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

    // ── TRACE: system prompt snapshot ─────────────────────────────────────
    {
      const promptLen = systemPrompt.length;
      const nudgePresent = systemPrompt.includes("DO NOT PLAN");
      const repairPresent = systemPrompt.includes("REPAIR CONTEXT");
      logInfo(
        `[runner:trace] ${issue.identifier} system prompt: len=${promptLen} ` +
        `nudge_injected=${nudgePresent} repair_context=${repairPresent} ` +
        `preview=${JSON.stringify(systemPrompt.slice(0, 200))}`,
      );
      traceLog("PROMPT", "system prompt snapshot", {
        len: promptLen, nudgeInjected: nudgePresent, repairContext: repairPresent,
        preview: systemPrompt.slice(0, 300),
      });
    }
    logInfo(
      `[runner:trace] ${issue.identifier} provider: name=${provider.name} model=${provider.model} attempt=${attempt}`,
    );
    traceLog("PROVIDER", "provider selected", { providerName: provider.name, model: provider.model, attempt });
    // ───────────────────────────────────────────────────────────────────────

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
      } catch (error_) {
        logWarn(`[runner] Abandonment writeback failed: ${error_.message}`);
      }
      sendDiscordEmbed({
        title: `⚠️ Abandoned | ${WORKTREE_ID}`,
        description: `${issue.identifier}: ${issue.title}`,
        color: 0xff0000,
        fields: [
          { name: "Reason", value: "Lease lost during execution", inline: true },
          { name: "Worktree", value: WORKTREE_ID, inline: true },
        ],
        threadName: issue.identifier,
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

    // ── TRACE: full agentResult at decision point ──────────────────────────
    logInfo(
      `[runner:trace] ${issue.identifier} agentResult: ` +
      `completed=${agentResult.completed} ` +
      `toolCalls=${agentResult.toolCalls} ` +
      `provider=${metricsProviderName} ` +
      `timedOut=${agentResult.timedOut} ` +
      `error=${agentResult.error ? JSON.stringify(agentResult.error.slice(0, 120)) : "none"} ` +
      `summary=${JSON.stringify((agentResult.summary || "").slice(0, 150))}`,
    );
    traceLog("AGENT_RESULT", "agentResult received", {
      completed: agentResult.completed,
      toolCalls: agentResult.toolCalls,
      provider: metricsProviderName,
      timedOut: agentResult.timedOut,
      error: agentResult.error ? agentResult.error.slice(0, 200) : null,
      summary: (agentResult.summary || "").slice(0, 300),
    });
    // ────────────────────────────────────────────────────────────────────────

    // If agent did real work (tool calls) but bridge returned completed=false,
    // check whether the failure is a known infrastructure error (quota, rate-limit,
    // local-busy). If it's just an unrecognised "other" failure, promote to
    // partial completion so the downstream changedFiles / continuation logic
    // handles it instead of applying exponential backoff meant for real errors.
    if (!agentResult.completed && agentResult.toolCalls > 0) {
      const preFailureKind = classifyProviderFailure(
        `${agentResult.summary} ${agentResult.error || ""}`,
      );
      if (preFailureKind === "other") {
        logInfo(
          `[runner] Agent returned completed=false but made ${agentResult.toolCalls} tool calls — treating as partial completion`,
        );
        agentResult.completed = true;
      }
    }

    if (!agentResult.completed) {
      const failureKind = classifyProviderFailure(
        `${agentResult.summary} ${agentResult.error || ""}`,
      );
      const failureMsg = agentResult.error || agentResult.summary || "Unknown failure";
      logInfo(
        `[runner:trace] ${issue.identifier} failure classification: ` +
        `failureKind=${failureKind} ` +
        `classifiedFrom=${JSON.stringify((agentResult.summary + " " + (agentResult.error||"")).slice(0,120))}`,
      );
      traceLog("FAILURE", "agent failure classified", {
        failureKind,
        failureMsg: failureMsg.slice(0, 300),
        completed: agentResult.completed,
        toolCalls: agentResult.toolCalls,
      });

      // No-action detection: agent produced text-only output with zero tool calls.
      // This is a behaviour failure (agent planned instead of acted), not a provider
      // error. Use a short flat cooldown, undo the retry-count increment so the
      // retry budget is preserved, and inject a "do not plan" nudge for next run.
      if (agentResult.toolCalls === 0 && failureKind === "other") {
        const stateBeforeUndo = getIssueState(issue.identifier);
        // no_action_done is set when the nudge was already injected and consumed.
        // If still no tool calls after the nudge, issue is likely already resolved.
        const nudgeAlreadyTried = stateBeforeUndo.notes?.no_action_done === true;
        logInfo(
          `[runner:trace] ${issue.identifier} no_action path: ` +
          `nudgeAlreadyTried=${nudgeAlreadyTried} ` +
          `no_action_nudge=${stateBeforeUndo.notes?.no_action_nudge} ` +
          `no_action_done=${stateBeforeUndo.notes?.no_action_done} ` +
          `retry_count=${stateBeforeUndo.retry_count} ` +
          `prior_retry_events=${(stateBeforeUndo.notes?.retry_events||[]).length} ` +
          `provider=${metricsProviderName}`,
        );
        traceLog("NO_ACTION", "agent produced 0 tool calls", {
          nudgeAlreadyTried,
          no_action_nudge: stateBeforeUndo.notes?.no_action_nudge,
          no_action_done: stateBeforeUndo.notes?.no_action_done,
          retry_count: stateBeforeUndo.retry_count,
          prior_retry_events: (stateBeforeUndo.notes?.retry_events||[]).length,
          provider: metricsProviderName,
        });

        if (nudgeAlreadyTried) {
          // Second consecutive no_action after nudge. Two distinct cases:
          // (a) Issue genuinely already resolved → safe to close as Done
          // (b) Agent is writing plan text instead of using tools (wrong model/provider) → NOT safe to close
          //
          // Distinguish by checking prior history: if the issue previously had real tool calls
          // or validation failures, the agent CAN use tools, so no_action means "already done".
          // If the issue has ONLY ever had quota/stream errors and no_action runs, the agent
          // never successfully used tools → likely a provider problem, not "already done".
          // Move to Backlog for human review instead of falsely closing.
          const hadPriorToolUse = (stateBeforeUndo.notes?.retry_events || []).some(
            (e) => e.type === "success" || (e.type === "failure" && e.reason === "validation_failed"),
          );
          const hasValidationHistory = getFinalizationState(issue.identifier)?.state?.includes("repairable");

          if (!hadPriorToolUse && !hasValidationHistory) {
            // Never successfully used tools — likely a provider/model problem, not "already resolved".
            // Move to Backlog for human review rather than silently closing.
            await updateIssue(issue.id, { stateId: STATES.backlog });
            markRetryExhausted(issue.identifier, { reason: "no_action_provider_issue" });
            await addComment(
              issue.id,
              safetyCap(`🔍 **Needs human review** — agent consistently produced text-only responses (0 tool calls) without ever successfully using tools on this issue. This usually means the model selected was in text-completion mode rather than tool-use mode.\n\nThe agent's last response described what to do correctly but didn't execute it:\n\n${agentResult.summary?.slice(0, 500)}`),
            );
            recordTransition(issue.identifier, { actor: "runner", reason: "no_action_provider_issue", from: "In Progress", to: "Backlog", runId: RUN_ID });
            logInfo(`[runner] 🔍 Backlog (no prior tool use — provider issue not resolution): ${issue.identifier}`);
            return "done";
          }

          // Agent previously used tools successfully → no_action now means issue is already resolved.
          transitionIssue(issue.identifier, "done", {
            finalization: {
              state: "completed_no_changes",
              worktreeId: WORKTREE_ID,
              headSha: getRepoHeadSha("HEAD"),
              reason: "no_action_after_nudge",
              toolCalls: 0,
              correlationId,
              updatedAt: new Date().toISOString(),
            },
            reason: "no_action_after_nudge",
          });
          await updateIssue(issue.id, { stateId: STATES.done });
          await addComment(
            issue.id,
            safetyCap(`✅ **Marked Done** — agent produced no tool calls on two consecutive attempts (after explicit nudge) but previously used tools successfully on this issue. Issue is likely already resolved.\n\nAgent summary: ${agentResult.summary}`),
          );
          recordTransition(issue.identifier, { actor: "runner", reason: "no_action_after_nudge", from: "In Progress", to: "Done", runId: RUN_ID });
          recordLinearCompletion(metricsProviderName, { completed: true, priority: issue.priority, estimate: issue.estimate });
          recordProviderSuccess(metricsProviderName);
          clearCooldown(issue.identifier);
          logInfo(`[runner] ✅ Done (no_action after nudge — likely already resolved): ${issue.identifier}`);
          return "done";
        }

        const NO_ACTION_COOLDOWN_MS = 3 * 60 * 1000;
        patchIssueState(issue.identifier, {
          retry_count: Math.max(0, (stateBeforeUndo.retry_count || 1) - 1),
          notes: { ...stateBeforeUndo.notes, no_action_nudge: true },
        });
        await updateIssue(issue.id, { stateId: STATES.todo });
        setCooldown(issue.identifier, NO_ACTION_COOLDOWN_MS, "no_action");
        await addComment(
          issue.id,
          safetyCap(
            `🔄 **No action taken** — agent produced text only (0 tool calls). Retrying in 3 min.\n\n` +
            `> **Next attempt:** do NOT write a plan. Immediately call tools: read the files listed in the description, locate the relevant lines, and make the changes. Do not explain what you are about to do — just do it.`,
          ),
        );
        recordTransition(issue.identifier, { actor: "runner", reason: "no_action", from: "In Progress", to: "Todo", runId: RUN_ID });
        return "done";
      }

      // Preserve dirty working tree for retry: when the agent fails after making
      // file changes, transition the worktree to dirty_owned so the next runner
      // invocation keeps the changes instead of auto-resetting them.
      // Without this, the runner auto-resets on the next cycle, throwing away
      // the agent's partial work and creating a retry loop with no progress.
      const hasDirtyFiles = getWorkingTreeStatus().blocked.length > 0;
      if (hasDirtyFiles && failureKind !== "local_busy") {
        transitionWorktree(WORKTREE_ID, "dirty_owned", {
          reason: "agent_failed_with_changes",
          issueIdentifier: issue.identifier,
          failureKind,
          updatedAt: new Date().toISOString(),
        });
      }

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
          error: failureMsg,
        });

        await addComment(
          issue.id,
          safetyCap(`⏳ **Local model busy** — returned to Todo with short cooldown.\n\nError: ${failureMsg}`),
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
          safetyCap(`⚠️ **Bridge failure** - all providers exhausted or bridge error: ${failureMsg}`),
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
          error: failureMsg,
        });

        await addComment(
          issue.id,
          safetyCap(`🚫 **Quota exhausted** — returned to Todo with exponential backoff (${Math.round(cooldownMs / 60000)}min).\n\nAttempt: ${attempt}/${RUNNER_MAX_RETRIES}\nError: ${failureMsg}`),
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
          error: failureMsg,
        });

        await addComment(
          issue.id,
          safetyCap(`⚠️ **Execution failed** — returned to Todo with exponential backoff (${Math.round(cooldownMs / 60000)}min).\n\nAttempt: ${attempt}/${RUNNER_MAX_RETRIES}\nError: ${failureMsg}`),
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
    logInfo(`[runner:trace] ${issue.identifier} changedFiles (${changedFiles.length}): [${changedFiles.join(", ")}]`);
    traceLog("CHANGED_FILES", "git diff names", { count: changedFiles.length, files: changedFiles });
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
              "Continue working on the active subgoals. Complete the remaining tasks and call task_complete when done. Make sure to run run_typecheck, run_lint, run_ast_density, and run_tests before calling task_complete.",
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
          } catch (error_) {
            logWarn(`[runner] Abandonment writeback failed: ${error_.message}`);
          }
          sendDiscordEmbed({
            title: `⚠️ Abandoned | ${WORKTREE_ID}`,
            description: `${issue.identifier}: ${issue.title}`,
            color: 0xff0000,
            fields: [
              { name: "Reason", value: "Lease lost during continuation", inline: true },
              { name: "Worktree", value: WORKTREE_ID, inline: true },
            ],
            threadName: issue.identifier,
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
      const externalLogEntry = [
        `[${new Date().toISOString()}] ${issue.identifier}: ${issue.title}`,
        `  provider=${agentResult.providerName || provider.name}  completed=${agentResult.completed}  toolCalls=${agentResult.toolCalls}  timedOut=${agentResult.timedOut}`,
        `  externally_completed=${isExternallyCompleted}  changed_files=${changedFiles?.length ?? 0}`,
        `  error=${agentResult.error ? agentResult.error.slice(0, 200) : "none"}`,
        `  Agent: ${(agentResult.summary || "").slice(0, 300)}`,
      ].join("\n") + "\n";
      try {
        const dir = resolve(ROOT, "reports", "symphony");
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        appendFileSync(externalLogPath, externalLogEntry);
      } catch {
        /* best effort logging */
      }

      // Agent-completed-without-file-changes handling: trust the AI's assessment.
      // The agent made tool calls and determined the work was complete. The lack of
      // git-tracked changes may be because: (a) the issue was a false positive,
      // (b) code was already compliant, or (c) the agent verified in-place without
      // producing a tracked diff. Cancel-causing this path wasted agent work.
      if (agentResult.completed === true && !isExternallyCompleted) {
        if (agentResult.toolCalls > 0) {
          // Agent completed with tool calls — trust the AI's completion assessment.
          const localSha = getRepoHeadSha("HEAD");
          const mainSha = getRepoHeadSha("origin/main");
          const headDelta = localSha === mainSha ? "(HEAD=main)" : `(HEAD=${localSha.slice(0,7)}, main=${mainSha.slice(0,7)})`;
          transitionIssue(issue.identifier, "done", {
            finalization: {
              state: "completed_no_changes",
              worktreeId: WORKTREE_ID,
              headSha: localSha,
              reason: "agent_assessed_complete",
              toolCalls: agentResult.toolCalls,
              correlationId,
              updatedAt: new Date().toISOString(),
            },
            reason: "agent_assessed_complete_no_changes",
          });
          await updateIssue(issue.id, { stateId: STATES.done });
          await addComment(
            issue.id,
            safetyCap(`✅ **Agent assessed work as complete** — marked Done.\n\nFinding: ${issue.identifier}\nTool calls: ${agentResult.toolCalls}\nFiles: ${changedFiles.length} changed\nGit: ${headDelta}\n\nThe AI determined the issue was resolved without producing tracked file changes (the code may already have been compliant, the issue may have been a false positive, or the agent verified in-place).\n\nAgent: ${agentResult.summary}`),
          );
          recordTransition(issue.identifier, {
            actor: "runner",
            reason: "agent_assessed_complete_no_changes",
            from: "In Progress",
            to: "Done",
            runId: RUN_ID,
          });
          const latencyMs = Date.now() - issueStartMs;
          recordCompletion(issue.identifier, {
            latencyMs,
            completedAt: new Date().toISOString(),
          });
          recordLinearCompletion(metricsProviderName, {
            completed: true,
            priority: issue.priority,
            estimate: issue.estimate,
          });
          recordProviderSuccess(metricsProviderName);
          clearCooldown(issue.identifier);
          logInfo(`[runner] ✅ Agent-assessed complete (no tracked changes): ${issue.identifier}`);
          voiceAnnounce(`Finished ${issue.identifier}: ${issue.title}.`);
        } else {
          // Agent said completed=true with zero tool calls and zero file changes.
          // Trust the assertion — issue is already resolved (false positive or previously fixed).
          // Returning to Todo with no cooldown was causing infinite tight cycling (45+ runs/hr).
          const localSha = getRepoHeadSha("HEAD");
          const mainSha = getRepoHeadSha("origin/main");
          transitionIssue(issue.identifier, "done", {
            finalization: {
              state: "completed_no_changes",
              worktreeId: WORKTREE_ID,
              headSha: localSha,
              reason: "agent_assessed_complete_no_tools",
              toolCalls: 0,
              correlationId,
              updatedAt: new Date().toISOString(),
            },
            reason: "agent_assessed_complete_no_tools",
          });
          await updateIssue(issue.id, { stateId: STATES.done });
          await addComment(
            issue.id,
            safetyCap(`✅ **Agent assessed work as complete** (no tool calls) — marked Done.\n\nThe agent determined the issue was already resolved without using file tools. This typically means the code was already compliant when the agent ran.\n\nAgent: ${agentResult.summary}`),
          );
          recordTransition(issue.identifier, {
            actor: "runner",
            reason: "agent_assessed_complete_no_tools",
            from: "In Progress",
            to: "Done",
            runId: RUN_ID,
          });
          recordLinearCompletion(metricsProviderName, {
            completed: true,
            priority: issue.priority,
            estimate: issue.estimate,
          });
          recordProviderSuccess(metricsProviderName);
          clearCooldown(issue.identifier);
          logInfo(`[runner] ✅ Agent-assessed complete (no tools, already resolved): ${issue.identifier}`);
          voiceAnnounce(`Finished ${issue.identifier}: ${issue.title}.`);
        }
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
        voiceAnnounce(`Finished ${issue.identifier}: ${issue.title}.`);
        return "done";
      }

      // Note: needsContinuation is now handled above with continueAgent call
      // This block is kept as fallback for cases where messages weren't available
      if (agentResult.needsContinuation === true && !agentResult.messages) {
        // No messages available for continuation - return to Todo
        await addComment(
          issue.id,
          safetyCap(`🔄 **Agent continuing work** — active subgoals detected (no prior messages available for continuation).\n\n${agentResult.summary}`),
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
            safetyCap(`🚫 **No file changes produced (repeated)** — same failure fingerprint. Moved to Backlog and blocked from automatic retry.\n\nAgent summary: ${agentResult.summary}`),
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
            safetyCap(`⚠️ **No file changes produced** — returned to Todo with cooldown for manual review.\n\nAgent summary: ${agentResult.summary}`),
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
      const syncResult = syncWorktreeBeforeValidation(ROOT);
      if (syncResult.synced) {
        logInfo(`[runner] Pre-validation sync: replayed local changes onto latest origin/main`);
      } else if (syncResult.method === "rebase-failed") {
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
        logWarn(
          `[runner] Pre-validation sync failed (non-fatal): ${syncResult.error || "unknown"}`,
        );
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

    if (correlationId) {
      try {
        recordExecutionResult(correlationId, {
          startedAt: new Date(issueStartMs).toISOString(),
          completedAt: new Date().toISOString(),
          durationMs: Date.now() - issueStartMs,
          success: agentResult.completed,
          filesChanged: changedFiles,
        });
      } catch {
        /* best-effort evidence */
      }
    }

    let preValidationPatchFile = null;
    try {
      preValidationPatchFile = writePreValidationPatch(changedFiles);
    } catch {
      /* best-effort snapshot */
    }

    let validation = await runValidation(ROOT, changedFiles, { heartbeat: validationHeartbeat });
    logInfo(
      `[runner:trace] ${issue.identifier} validation: passed=${validation.passed} ` +
      `checks=${(validation.results||[]).map(r=>`${r.check}:${r.pass?"PASS":"FAIL"}`).join(",")} ` +
      `signature=${validation.signature||"none"}`,
    );
    traceLog("VALIDATION", "validation result", {
      passed: validation.passed,
      signature: validation.signature || null,
      results: (validation.results||[]).map(r=>({ check: r.check, pass: r.pass })),
    });

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
      setCooldown(issue.identifier, RUNNER_ISSUE_COOLDOWN_MS, `lease_lost_during_validation:${hbReason}`, hbReason);
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
      } catch (error_) {
        logWarn(`[runner] Abandonment writeback failed: ${error_.message}`);
      }
      sendDiscordEmbed({
        title: `⚠️ Abandoned | ${WORKTREE_ID}`,
        description: `${issue.identifier}: ${issue.title}`,
        color: 0xff0000,
        fields: [
          { name: "Reason", value: `Lease lost during validation: ${hbReason}`, inline: true },
          { name: "Worktree", value: WORKTREE_ID, inline: true },
        ],
        threadName: issue.identifier,
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
          `[runner] ${leaseValid ? "Wall-clock exhausted" : "Lease lost"} during validation fixes — breaking`,
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
      removeTempFile(preValidationPatchFile);
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
      } catch (error_) {
        logWarn(`[runner] Abandonment writeback failed: ${error_.message}`);
      }
      sendDiscordEmbed({
        title: `⚠️ Abandoned | ${WORKTREE_ID}`,
        description: `${issue.identifier}: ${issue.title}`,
        color: 0xff0000,
        fields: [
          { name: "Reason", value: "Lease lost during validation fixes", inline: true },
          { name: "Worktree", value: WORKTREE_ID, inline: true },
        ],
        threadName: issue.identifier,
      }).catch(() => {});
      recordLinearCompletion(metricsProviderName, {
        completed: false,
        priority: issue.priority,
        estimate: issue.estimate,
      });
      return "done";
    }

    // Clean up pre-validation patch file now that validation loop is done
    removeTempFile(preValidationPatchFile);

    if (correlationId) {
      try {
        recordValidationResult(correlationId, {
          passed: validation.passed,
          typecheckPassed: validation.results?.find((r) => r.check === "typecheck")?.pass ?? null,
          testsPassed: validation.results?.find((r) => r.check === "test-unit" || r.check === "vitest")?.pass ?? null,
          lintPassed:
            validation.results?.find((r) => r.check === "oxlint" || r.check === "lint")?.pass ??
            null,
          errors: validation.results?.filter((r) => !r.pass).map((r) => r.check) || [],
        });
      } catch {
        /* best-effort evidence */
      }
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
          .map((r) => `### ${r.check}\n${String(r.detail)}\n`)
          .join("\n");

        // Write full validation output to sidecar file for next repair cycle
        const sidecarPath = gitMetadataPath("SYMPHONY_VALIDATION_ERRORS");
        try {
          writeFileSync(sidecarPath, validationErrors, "utf-8");
        } catch {
          /* best effort */
        }

        transitionIssue(issue.identifier, "validation_failed", {
          finalization: {
            state: "validation_failed_repairable",
            worktreeId: WORKTREE_ID,
            stickyOwner: WORKTREE_ID,
            lastError: validationErrors,
            attempts: valRepairAttempts,
            correlationId,
          },
          reason: "validation_failed_repairable",
        });
        transitionWorktree(WORKTREE_ID, "dirty_owned", { assignedIssue: issue.identifier });
        await updateIssue(issue.id, { stateId: STATES.inReview });
        await addComment(
          issue.id,
          safetyCap(`❌ **Validation failed** (repair ${valRepairAttempts}/${RUNNER_VALIDATION_REPAIR_MAX}) — preserving dirty tree for same-worktree repair.\n\n${validationErrors}`),
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
          safetyCap(`❌ **Validation failed** after ${validationFixAttempts} fix attempt(s). Moved to Backlog and blocked from automatic retry.\n\n${validation.results
            .filter((r) => !r.pass)
            .map(
              (r) => `### ${r.check}\n\
${String(r.detail)}\n`,
            )
            .join("\n")}`),
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
          safetyCap(`🚫 **Validation failed (repeated same signature)** after ${validationFixAttempts} fix attempt(s). Quarantined to Backlog.\n\n${validation.results
            .filter((r) => !r.pass)
            .map((r) => `### ${r.check}\n${String(r.detail)}\n`)
            .join("\n")}`),
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
          safetyCap(`❌ **Validation failed** after ${validationFixAttempts} fix attempt(s). Returned to Todo with cooldown.\n\n${validation.results
            .filter((r) => !r.pass)
            .map(
              (r) => `### ${r.check}\n\
${String(r.detail)}\n`,
            )
            .join("\n")}`),
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

    // If agent only modified CHANGELOG.md it made no substantive changes — treat as refusal/no-op.
    const substantiveFiles = changedFiles.filter((f) => !f.replace(/^[MAD?!]\s+/, "").trim().endsWith("CHANGELOG.md"));
    if (substantiveFiles.length === 0 && changedFiles.length > 0) {
      gitRevert();
      await updateIssue(issue.id, { stateId: STATES.canceled });
      await addComment(
        issue.id,
        safetyCap(`❌ **Agent produced no substantive changes** (only CHANGELOG.md modified — likely a model refusal) — canceled.\n\nAgent summary: ${agentResult.summary}`),
      );
      recordTransition(issue.identifier, {
        actor: "runner",
        reason: "agent_only_changelog_canceled",
        from: "In Progress",
        to: "Canceled",
        runId: RUN_ID,
      });
      if (provider?.name) {
        recordLinearCompletion(metricsProviderName, {
          completed: false,
          priority: issue.priority,
          estimate: issue.estimate,
        });
      }
      logInfo(`[runner] ❌ Only CHANGELOG.md changed (model refusal?): ${issue.identifier} — canceled`);
      return "done";
    }

    const diffStat = gitDiffStat();
    if (!gitCommit(issue.identifier, issue.title, agentResult.summary, changedFiles)) {
      // Check if issue is already fixed: changedFiles=[] AND headSha matches origin/main
      // This prevents entering commit_failed_repairable loop for already-resolved findings
      const headSha = getRepoHeadSha("HEAD");
      const mainSha = getRepoHeadSha("origin/main");
      if (changedFiles.length === 0 && headSha === mainSha) {
        logInfo(
          `[runner] Issue ${issue.identifier} has no changes and HEAD=main — already fixed, canceling`,
        );
        await updateIssue(issue.id, { stateId: STATES.canceled });
        await addComment(
          issue.id,
          `✅ **Already fixed** — no changes needed. The finding was already resolved on main.\n\nHEAD: ${headSha.slice(0, 8)}\norigin/main: ${mainSha.slice(0, 8)}`,
        );
        recordTransition(issue.identifier, {
          actor: "runner",
          reason: "already_fixed_no_changes",
          from: "In Progress",
          to: "Canceled",
          runId: RUN_ID,
        });
        recordLinearCompletion(metricsProviderName, {
          completed: true,
          priority: issue.priority,
          estimate: issue.estimate,
        });
        recordProviderSuccess(metricsProviderName);
        clearCooldown(issue.identifier);
        logInfo(`[runner] ✅ Canceled (already fixed): ${issue.identifier}`);
        return "done";
      }

      const priorFinalization = getFinalizationState(issue.identifier);
      const commitAttempts = (priorFinalization?.attempts || 0) + 1;
      if (commitAttempts > 3) {
        gitRevert();
        transitionIssue(issue.identifier, "commit_failed", {
          finalization: {
            state: "commit_failed_blocked",
            worktreeId: WORKTREE_ID,
            stickyOwner: WORKTREE_ID,
            lastError: "git commit failed repeatedly",
            attempts: commitAttempts,
            correlationId,
            updatedAt: new Date().toISOString(),
          },
          reason: "commit_failed_blocked",
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
        transitionIssue(issue.identifier, "commit_failed", {
          finalization: {
            state: "commit_failed_repairable",
            worktreeId: WORKTREE_ID,
            stickyOwner: WORKTREE_ID,
            branch: currentBranchNameForRunner(),
            headSha: getRepoHeadSha("HEAD"),
            lastError: "git commit failed during finalization",
            attempts: commitAttempts,
            correlationId,
            updatedAt: new Date().toISOString(),
          },
          reason: "commit_failed_repairable",
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
      logInfo(
        `[runner:trace] ${issue.identifier} push: ok=${branchPush.ok} branch=${branchPush.branch||"?"} sha=${branchPush.head||"?"} error=${branchPush.error||"none"}`,
      );
      traceLog("PUSH", "git push result", { ok: branchPush.ok, branch: branchPush.branch||null, sha: branchPush.head||null, error: branchPush.error||null });
      if (correlationId) {
        try {
          recordPushResult(correlationId, {
            branch: branchPush.branch || null,
            sha: branchPush.head || null,
            success: branchPush.ok,
            error: branchPush.error || null,
          });
        } catch {
          /* best-effort evidence */
        }
      }
      if (branchPush.ok) {
        transitionIssue(issue.identifier, "integration_pending", {
          finalization: {
            state: "integration_pending",
            worktreeId: WORKTREE_ID,
            branch: branchPush.branch,
            baseMainSha: getRepoHeadSha("origin/main"),
            headSha: branchPush.head,
            attempts: 0,
            stickyOwner: WORKTREE_ID,
            lastError: null,
            correlationId,
            updatedAt: new Date().toISOString(),
          },
          reason: "branch_push_success",
        });
      } else {
        transitionIssue(issue.identifier, "push_failed", {
          finalization: {
            state: "branch_push_failed_repairable",
            worktreeId: WORKTREE_ID,
            stickyOwner: WORKTREE_ID,
            branch: branchPush.branch,
            headSha: branchPush.head,
            lastError: branchPush.error || "push failed",
            correlationId,
            attempts: 1,
            updatedAt: new Date().toISOString(),
          },
          reason: "branch_push_failed",
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

    await addComment(issue.id, safetyCap(completionComment));

    const commitHash = execFileSync("git", ["rev-parse", "--short", "HEAD"], {
      cwd: ROOT,
      encoding: "utf-8",
    }).trim();
    logInfo(`[runner:trace] ${issue.identifier} commit: sha=${commitHash} files=${changedFiles.length} push=${branchPush.ok}`);
    traceLog("COMMIT", "commit created", { sha: commitHash, files: changedFiles, pushed: branchPush.ok });

    await runSonarPostCommit(issue.identifier);
    // Only update Linear state if push failed — when push succeeded the integrator
    // owns the issue and will mark it Done. Calling updateIssue here after a
    // successful push creates a race: integrator marks Done, then runner resets to
    // In Review seconds later.
    if (!branchPush.ok) {
      await updateIssue(issue.id, { stateId: finalStateId });
    }

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
    voiceAnnounce(`Finished ${issue.identifier}: ${issue.title}.`);

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

    const discordResult = await sendDiscordEmbed({
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
      threadName: issue.identifier,
    }).catch((err) => {
      logWarn(`Discord notification failed: ${err.message}`);
      return { sent: false };
    });
    if (discordResult?.messageId) {
      const freshNotes = getIssueState(issue.identifier).notes || {};
      patchIssueState(issue.identifier, {
        notes: { ...freshNotes, discordMessageId: discordResult.messageId },
      });
    }

    return "done";
  } finally {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    releaseLease(issue.identifier, leaseNonce);
    // Phase 0: Reset worktree state unless marked dirty for repair
    const finalWtState = getWorktreeState(WORKTREE_ID);
    if (finalWtState?.state === "executing") {
      transitionWorktree(WORKTREE_ID, "available", { assignedIssue: null });
    }
    // Clean up validation sidecar file on successful completion
    const sidecarCleanup = gitMetadataPath("SYMPHONY_VALIDATION_ERRORS");
    try {
      if (existsSync(sidecarCleanup)) unlinkSync(sidecarCleanup);
    } catch {
      /* best effort */
    }
  }
}
