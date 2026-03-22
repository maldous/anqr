#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  listIssuesByState,
  updateIssue,
  addComment,
  updateComment,
  getIssueDetail,
  STATES,
} from "../linear-client.mjs";
import {
  RUNNER_MAX_RETRIES,
  RUNNER_AUTO_PUSH,
  RUNNER_MAX_VALIDATION_FIXES,
  RUNNER_VALIDATION_FIX_TURNS,
  RUNNER_ISSUE_COOLDOWN_MS,
  QUEUE_STATES,
  TARGET_MIN,
  RUNNER_STUCK_THRESHOLD_MS,
} from "../symphony-config.mjs";
import { feedQueue, getQueueSnapshot } from "../symphony-queue-control.mjs";
import { selectProvider, recordProviderFailure } from "../symphony-credit-gate.mjs";
import { runAgent, continueAgent } from "../symphony-agent.mjs";
import {
  fetchAllSonarIssues,
  fetchAllSonarHotspots,
  fetchAllSonarDuplicationIssues,
  syncSonarToLinear,
  syncSonarHotspotsToLinear,
  syncSonarDuplicationsToLinear,
} from "../lib/sonar-linear-sync.mjs";
import {
  acquireLease,
  releaseLease,
  heartbeatLease,
  noteAttemptStart,
  markRetryExhausted,
  setCooldown,
  clearCooldown,
  getIssueState,
  canExecuteIssue,
  recordTransition,
  setGlobalValue,
  getGlobalValue,
} from "../symphony-state.mjs";
import {
  runValidation,
  runGlobalPreflights,
  formatValidationFeedback,
  validationManifestHash,
} from "../symphony-validation.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(__dirname, "..", "..", "..");
const WORKFLOW_PATH = resolve(ROOT, "scripts/ops/symphony/WORKFLOW.md");

const uid = process.getuid?.() ?? 1000;
const STATE_DIR = `/run/user/${uid}/symphony-runner`;
const LOCK_FILE = resolve(STATE_DIR, "lock");
const RUN_ID = `run-${Date.now()}-${process.pid}`;
const LEASE_TTL_MS = Number(
  process.env.ANQR_SYMPHONY_LEASE_MS || Math.max(RUNNER_STUCK_THRESHOLD_MS, 20 * 60 * 1000),
);

function ensureRuntimeStateDir() {
  if (!existsSync(STATE_DIR)) mkdirSync(STATE_DIR, { recursive: true, mode: 0o700 });
}

function acquireLock() {
  ensureRuntimeStateDir();
  if (existsSync(LOCK_FILE)) {
    const existingPid = Number(readFileSync(LOCK_FILE, "utf-8").trim());
    if (existingPid && isProcessAlive(existingPid)) return false;
    unlinkSync(LOCK_FILE);
  }
  writeFileSync(LOCK_FILE, String(process.pid));
  return true;
}

function releaseLock() {
  try {
    if (!existsSync(LOCK_FILE)) return;
    const pid = Number(readFileSync(LOCK_FILE, "utf-8").trim());
    if (pid === process.pid) unlinkSync(LOCK_FILE);
  } catch {
    // best effort
  }
}

function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function gitIsClean() {
  try {
    const status = execFileSync("git", ["status", "--porcelain"], { cwd: ROOT, encoding: "utf-8" });
    return status.trim().length === 0;
  } catch {
    return false;
  }
}

function gitDiffNames() {
  try {
    const diff = execFileSync("git", ["diff", "--name-only"], { cwd: ROOT, encoding: "utf-8" });
    const untracked = execFileSync("git", ["ls-files", "--others", "--exclude-standard"], {
      cwd: ROOT,
      encoding: "utf-8",
    });
    return [...diff.trim().split("\n"), ...untracked.trim().split("\n")].filter(Boolean);
  } catch {
    return [];
  }
}

function gitDiffStat() {
  try {
    return execFileSync("git", ["diff", "--stat"], { cwd: ROOT, encoding: "utf-8" }).trim();
  } catch {
    return "";
  }
}

function gitRevert() {
  try {
    execFileSync("git", ["reset", "--hard", "HEAD"], { cwd: ROOT, stdio: "pipe" });
    execFileSync("git", ["clean", "-fd"], { cwd: ROOT, stdio: "pipe" });
    return true;
  } catch (err) {
    console.error(`[runner] Git revert failed: ${err.message}`);
    return false;
  }
}

const SCOPE_RULES = [
  { pattern: /^src\/domain\//, scope: "domain" },
  { pattern: /^src\/platform\//, scope: "platform" },
  { pattern: /^src\/(ui|components)\//, scope: "ui" },
  { pattern: /^src\/features\//, scope: "application" },
  { pattern: /^src\/infra\/(logging|monitoring|sentry)/, scope: "observability" },
  { pattern: /^scripts\/ops\//, scope: "harness" },
  { pattern: /^docs\//, scope: "docs" },
  { pattern: /^\.github\/|^ci\//, scope: "ci" },
];
const HEADER_MAX_LENGTH = 100;

function inferCommitScope(changedFiles) {
  const counts = {};
  for (const file of changedFiles) {
    for (const rule of SCOPE_RULES) {
      if (rule.pattern.test(file)) {
        counts[rule.scope] = (counts[rule.scope] || 0) + 1;
        break;
      }
    }
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "architecture";
}

function sanitizeCommitSubject(title) {
  let subject = title.trim();
  while (subject.endsWith(".")) subject = subject.slice(0, -1);
  if (subject.length > 0) subject = subject[0].toLowerCase() + subject.slice(1);
  return subject;
}

function gitCommit(issueIdentifier, issueTitle, summary, changedFiles) {
  try {
    execFileSync("git", ["add", "-A"], { cwd: ROOT, stdio: "pipe" });
    const scope = inferCommitScope(changedFiles);
    const subject = sanitizeCommitSubject(issueTitle);
    const prefix = `fix(${scope}): `;
    const maxSubjectLen = HEADER_MAX_LENGTH - prefix.length;
    const truncatedSubject =
      subject.length > maxSubjectLen ? `${subject.slice(0, maxSubjectLen - 1)}…` : subject;
    const header = `${prefix}${truncatedSubject}`;
    const body = `${issueIdentifier}\n\n${summary}`;
    const msg = `${header}\n\n${body}`;
    const tmpFile = resolve(ROOT, ".git", "SYMPHONY_COMMIT_MSG");
    writeFileSync(tmpFile, msg, "utf-8");
    try {
      execFileSync("git", ["commit", "-F", tmpFile], { cwd: ROOT, stdio: "pipe" });
    } finally {
      try {
        unlinkSync(tmpFile);
      } catch {}
    }
    return true;
  } catch (err) {
    console.error(`[runner] Git commit failed: ${err.message}`);
    return false;
  }
}

function gitPush() {
  try {
    execFileSync("git", ["push"], { cwd: ROOT, stdio: "pipe", timeout: 30_000 });
    return true;
  } catch (err) {
    console.error(`[runner] Git push failed: ${err.message}`);
    return false;
  }
}

function isBaselineRepairIssue(issue) {
  return issue.title?.startsWith("Harness");
}

function classifyProviderFailure(message = "") {
  const msg = String(message || "");
  if (msg.includes("LOCAL_BUSY") || msg.includes("local_busy")) return "local_busy";
  if (
    msg.includes("429") ||
    msg.includes("quota") ||
    msg.includes("insufficient_quota") ||
    msg.includes("rate_limit") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.includes("accounts exhausted") ||
    msg.includes("All codebuff")
  )
    return "quota";
  if (msg.includes("LLM call failed") || msg.includes("No choices")) return "provider";
  return "other";
}

async function maybeRunPreflights() {
  const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: ROOT, encoding: "utf-8" }).trim();
  const manifestHash = validationManifestHash();
  const cachedHead = getGlobalValue("baseline.head");
  const cachedHash = getGlobalValue("baseline.manifestHash");
  const cachedPass = getGlobalValue("baseline.pass");
  if (cachedHead === head && cachedHash === manifestHash && cachedPass === true) {
    console.log("[runner] Baseline cache hit — skipping full pre-flights");
    return { pass: true, cached: true };
  }
  const result = runGlobalPreflights(ROOT);
  setGlobalValue("baseline.head", head);
  setGlobalValue("baseline.manifestHash", manifestHash);
  setGlobalValue("baseline.pass", Boolean(result.pass));
  setGlobalValue("baseline.checkedAt", new Date().toISOString());
  return result;
}

async function pickIssue({ excludeIds = new Set(), baselineOnly = false } = {}) {
  const todoIssues = await listIssuesByState(QUEUE_STATES.readyStates);
  const candidates = todoIssues
    .filter((issue) => !excludeIds.has(issue.id))
    .filter((issue) => canExecuteIssue(issue))
    .filter((issue) => (baselineOnly ? isBaselineRepairIssue(issue) : true))
    .sort(
      (a, b) =>
        (a.priority ?? 99) - (b.priority ?? 99) || new Date(a.createdAt) - new Date(b.createdAt),
    );
  return candidates[0] || null;
}

async function runSonarPostCommit(issueIdentifier) {
  const SONAR_TOKEN = process.env.SONAR_TOKEN;
  const SONAR_HOST = process.env.SONAR_HOST_URL || "http://localhost:9000";
  const PROJECT_KEY = "anqr";
  if (!SONAR_TOKEN) return;
  try {
    execFileSync("sonar-scanner", [], {
      cwd: ROOT,
      timeout: 300_000,
      stdio: "pipe",
      env: {
        ...process.env,
        SONAR_TOKEN,
        SONAR_SCANNER_OPTS: "-Xms128m -Xmx256m",
        NODE_OPTIONS: "",
      },
    });
    await new Promise((r) => setTimeout(r, 10_000));
    const [issues, hotspots, dupIssues] = await Promise.all([
      fetchAllSonarIssues(SONAR_TOKEN, SONAR_HOST, PROJECT_KEY),
      fetchAllSonarHotspots(SONAR_TOKEN, SONAR_HOST, PROJECT_KEY),
      fetchAllSonarDuplicationIssues(SONAR_TOKEN, SONAR_HOST, PROJECT_KEY),
    ]);
    await syncSonarToLinear({
      sonarIssues: issues,
      projectKey: PROJECT_KEY,
      sonarHost: SONAR_HOST,
      priority: 1,
      resolveStale: true,
      requeueToTodo: false,
    });
    await syncSonarHotspotsToLinear({
      sonarHotspots: hotspots,
      projectKey: PROJECT_KEY,
      sonarHost: SONAR_HOST,
      priority: 1,
      resolveStale: true,
      requeueToTodo: false,
    });
    await syncSonarDuplicationsToLinear({
      sonarDupIssues: dupIssues,
      projectKey: PROJECT_KEY,
      sonarHost: SONAR_HOST,
      priority: 2,
      resolveStale: true,
      requeueToTodo: false,
    });
    console.log(`[runner] Sonar post-commit complete for ${issueIdentifier}`);
  } catch (err) {
    console.warn(`[runner] Sonar post-commit scan failed (non-fatal): ${err.message}`);
  }
}

async function executeIssue(issue, dryRun = false) {
  const detail = await getIssueDetail(issue.id);
  if (!detail) return "skip";

  const state = getIssueState(issue.identifier);
  const attempt = Number(state.retry_count || 0) + 1;
  console.log(
    `[runner] Attempt ${attempt}/${RUNNER_MAX_RETRIES} for ${issue.identifier}: ${issue.title}`,
  );

  if (attempt > RUNNER_MAX_RETRIES) {
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
    return "skip";
  }

  const leaseNonce = `${RUN_ID}:${issue.identifier}:${Date.now()}`;
  const lease = acquireLease(issue.identifier, {
    owner: "runner",
    nonce: leaseNonce,
    runId: RUN_ID,
    ttlMs: LEASE_TTL_MS,
  });
  if (!lease.ok) {
    console.log(`[runner] Lease unavailable for ${issue.identifier} — skipping`);
    return "skip";
  }

  let startingCommentId = null;
  try {
    noteAttemptStart(issue.identifier, { runId: RUN_ID });
    clearCooldown(issue.identifier);
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

    let systemPrompt = "You are a coding agent. Implement the requested changes.";
    if (existsSync(WORKFLOW_PATH)) systemPrompt = readFileSync(WORKFLOW_PATH, "utf-8");

    let provider = null;
    let agentResult = null;
    const triedProviders = [];

    while (triedProviders.length < 12) {
      provider = await selectProvider();
      if (!provider) {
        setCooldown(issue.identifier, RUNNER_ISSUE_COOLDOWN_MS, "no_provider_available");
        await updateIssue(issue.id, { stateId: STATES.todo });
        await addComment(
          issue.id,
          "❌ **No LLM provider available** — all providers exhausted or unhealthy. Returned to Todo with cooldown.",
        );
        recordTransition(issue.identifier, {
          actor: "runner",
          reason: "no_provider",
          from: "In Progress",
          to: "Todo",
          runId: RUN_ID,
        });
        return "done";
      }

      triedProviders.push(provider.name);
      if (startingCommentId) {
        await updateComment(
          startingCommentId,
          `🤖 **Symphony agent starting** (Attempt ${attempt}/${RUNNER_MAX_RETRIES})\n\n**Provider:** ${provider.name} (${provider.model})\n**Run:** ${RUN_ID}`,
        );
      }
      heartbeatLease(issue.identifier, leaseNonce, LEASE_TTL_MS);
      try {
        agentResult = await runAgent({ provider, issue: detail, projectRoot: ROOT, systemPrompt });
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
        };
      }
      heartbeatLease(issue.identifier, leaseNonce, LEASE_TTL_MS);

      if (agentResult.completed) break;
      const failureKind = classifyProviderFailure(
        `${agentResult.summary} ${agentResult.error || ""}`,
      );
      if (failureKind === "quota" || failureKind === "provider") {
        recordProviderFailure(provider.name);
        gitRevert();
        continue;
      }
      if (failureKind === "local_busy") {
        await updateIssue(issue.id, { stateId: STATES.todo });
        setCooldown(issue.identifier, 2 * 60 * 1000, "local_busy");
        await addComment(
          issue.id,
          "⏳ **Local model busy** — returned to Todo with short cooldown.",
        );
        recordTransition(issue.identifier, {
          actor: "runner",
          reason: "local_busy",
          from: "In Progress",
          to: "Todo",
          runId: RUN_ID,
        });
        return "done";
      }
      break;
    }

    if (!agentResult) {
      setCooldown(issue.identifier, RUNNER_ISSUE_COOLDOWN_MS, "all_providers_failed");
      await updateIssue(issue.id, { stateId: STATES.todo });
      await addComment(issue.id, `❌ **All providers failed**. Returned to Todo with cooldown.`);
      recordTransition(issue.identifier, {
        actor: "runner",
        reason: "all_providers_failed",
        from: "In Progress",
        to: "Todo",
        runId: RUN_ID,
      });
      return "done";
    }

    let changedFiles = gitDiffNames();
    if (changedFiles.length === 0) {
      // Check if agent is still planning/working via sub-goals - don't return to Todo if still active
      const messages = agentResult.messages || [];
      const hasActiveSubGoals = messages.some((m) => m.toolName === "update_subgoal");
      
      // Check if work was completed externally (by human or another process)
      // by checking if the issue has been resolved/closed externally
      const summary = agentResult.summary?.toLowerCase() || "";
      const isExternallyCompleted =
        detail?.state?.name === "Done" ||
        detail?.state?.name === "Canceled" ||
        summary.includes("already") ||
        summary.includes("completed") ||
        summary.includes("external") ||
        summary.includes("human") ||
        summary.includes("no longer needed");

      // Document external completion in a log file for audit trail
      const externalLogPath = resolve(ROOT, "reports", "symphony", "external-completions.log");
      const externalLogEntry = `[${new Date().toISOString()}] ${issue.identifier}: ${issue.title}\n  Agent: ${agentResult.summary?.slice(0, 200)}\n  Externally completed: ${isExternallyCompleted}\n`;
      try {
        const dir = resolve(ROOT, "reports", "symphony");
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        appendFileSync(externalLogPath, externalLogEntry);
      } catch { /* best effort logging */ }

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
        // Clear any cooldown so it doesn't get re-queued
        clearCooldown(issue.identifier);
        return "done";
      }
      
      if (hasActiveSubGoals) {
        // Agent is still planning/working via sub-goals - stay in progress, clear cooldown
        await addComment(
          issue.id,
          `🔄 **Agent still planning** — sub-goals detected, continuing work in next turn.\n\nCurrent plan:\n${agentResult.summary}`,
        );
        clearCooldown(issue.identifier);
        // Return to Todo but with no cooldown so it can be picked up immediately
        await updateIssue(issue.id, { stateId: STATES.todo });
        recordTransition(issue.identifier, {
          actor: "runner",
          reason: "sub_goal_continuing",
          from: "In Progress",
          to: "Todo",
          runId: RUN_ID,
        });
        return "done";
      }
      
      // Unknown reason for no changes - return to Todo with cooldown for manual review
      setCooldown(issue.identifier, RUNNER_ISSUE_COOLDOWN_MS, "no_file_changes");
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
      return "done";
    }

    let validation = runValidation(ROOT, changedFiles);
    let validationFixAttempts = 0;
    let previousSignature = validation.signature;

    while (!validation.passed && validationFixAttempts < RUNNER_MAX_VALIDATION_FIXES) {
      validationFixAttempts += 1;
      const feedback = formatValidationFeedback(validation);
      const fixResult = await continueAgent({
        provider,
        messages: agentResult.messages,
        projectRoot: ROOT,
        feedback,
        maxTurns: RUNNER_VALIDATION_FIX_TURNS,
        maxMs: RUNNER_VALIDATION_FIX_TURNS * 15_000,
      });
      agentResult.turns += fixResult.turns;
      agentResult.toolCalls += fixResult.toolCalls;
      agentResult.messages = fixResult.messages;
      if (fixResult.error || fixResult.turns === 0) break;
      changedFiles = gitDiffNames();
      if (changedFiles.length === 0) break;
      const nextValidation = runValidation(ROOT, changedFiles);
      const sameSignature =
        nextValidation.signature && nextValidation.signature === previousSignature;
      validation = nextValidation;
      if (sameSignature) break;
      previousSignature = validation.signature;
    }

    if (!validation.passed) {
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
      } else {
        setCooldown(issue.identifier, RUNNER_ISSUE_COOLDOWN_MS, "validation_failed");
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
      }
      return "done";
    }

    const diffStat = gitDiffStat();
    if (!gitCommit(issue.identifier, issue.title, agentResult.summary, changedFiles)) {
      gitRevert();
      setCooldown(issue.identifier, RUNNER_ISSUE_COOLDOWN_MS, "git_commit_failed");
      await updateIssue(issue.id, { stateId: STATES.todo });
      await addComment(
        issue.id,
        "❌ **Git commit failed** after successful validation. Reverted and returned to Todo with cooldown.",
      );
      recordTransition(issue.identifier, {
        actor: "runner",
        reason: "git_commit_failed",
        from: "In Progress",
        to: "Todo",
        runId: RUN_ID,
      });
      return "done";
    }

    let finalStateId = STATES.inReview;
    let finalStateName = "In Review";
    let pushConfirmed = false;
    if (RUNNER_AUTO_PUSH) {
      pushConfirmed = gitPush();
      if (pushConfirmed) {
        finalStateId = STATES.done;
        finalStateName = "Done";
      }
    }

    await addComment(
      issue.id,
      [
        `✅ **Symphony agent completed** (Attempt ${attempt}/${RUNNER_MAX_RETRIES})`,
        "",
        `**Run:** ${RUN_ID}`,
        `**Provider:** ${provider.name} (${provider.model})`,
        `**Turns:** ${agentResult.turns}`,
        `**Tool calls:** ${agentResult.toolCalls}`,
        `**Files changed:** ${changedFiles.length}`,
        `**Validation fix attempts:** ${validationFixAttempts}`,
        `**Promotion state:** ${finalStateName}`,
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
      ].join("\n"),
    );

    await runSonarPostCommit(issue.identifier);
    await updateIssue(issue.id, { stateId: finalStateId });
    recordTransition(issue.identifier, {
      actor: "runner",
      reason: pushConfirmed ? "push_confirmed" : "local_commit_complete",
      from: "In Progress",
      to: finalStateName,
      runId: RUN_ID,
    });

    if (!RUNNER_AUTO_PUSH) {
      await addComment(
        issue.id,
        "ℹ️ **Auto-push disabled** — leaving issue In Review. Mark Done only after remote push/review.",
      );
    } else if (!pushConfirmed) {
      await addComment(
        issue.id,
        "⚠️ **Push failed** — commit exists locally but remote push was not confirmed. Leaving issue In Review.",
      );
    }

    return "done";
  } finally {
    releaseLease(issue.identifier, leaseNonce);
  }
}

function showStatus() {
  console.log("[runner] Symphony Runner Status\n");
  if (existsSync(LOCK_FILE)) {
    const pid = readFileSync(LOCK_FILE, "utf-8").trim();
    console.log(`  Lock: ${isProcessAlive(Number(pid)) ? "🔒 LOCKED" : "🔓 stale"} (PID ${pid})`);
  } else {
    console.log("  Lock: 🔓 available");
  }
  console.log(`  Git clean: ${gitIsClean() ? "✅" : "❌"}`);
  console.log(`  LINEAR_API_KEY: ${process.env.LINEAR_API_KEY ? "✅" : "❌ not set"}`);
  console.log(`  Run ID: ${RUN_ID}`);
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has("--dry-run");
  const doOnce = args.has("--once");
  const doStatus = args.has("--status");
  if (doStatus) {
    showStatus();
    process.exit(0);
  }
  if (!doOnce) {
    console.error("Usage: symphony-runner.mjs --once [--dry-run] | --status");
    process.exit(2);
  }
  console.log(`[runner]${dryRun ? " (DRY RUN)" : ""} starting at ${new Date().toISOString()}`);
  if (!process.env.LINEAR_API_KEY) {
    console.error("[runner] LINEAR_API_KEY is not set");
    process.exit(1);
  }
  if (!acquireLock()) {
    console.log("[runner] Another runner instance is active — exiting");
    process.exit(0);
  }
  process.on("exit", releaseLock);
  process.on("SIGINT", () => {
    releaseLock();
    process.exit(130);
  });
  process.on("SIGTERM", () => {
    releaseLock();
    process.exit(143);
  });

  try {
    if (!gitIsClean()) {
      console.error(
        "[runner] Git working tree is dirty — refusing to run in a shared or unsafe worktree",
      );
      process.exit(1);
    }

    const preflight = dryRun ? { pass: true } : await maybeRunPreflights();
    const baselineOnly = !preflight.pass;
    if (!preflight.pass) {
      console.warn(
        `[runner] Baseline pre-flight ${preflight.check} failed — only baseline-repair issues may run this cycle`,
      );
    }

    const excludeIds = new Set();
    let executed = false;
    while (!executed) {
      const issue = await pickIssue({ excludeIds, baselineOnly });
      if (!issue) break;
      const status = await executeIssue(issue, dryRun);
      if (status === "skip") {
        excludeIds.add(issue.id);
        continue;
      }
      executed = true;
    }

    if (!dryRun) {
      const snap = await getQueueSnapshot();
      if (snap.queueDepth < TARGET_MIN) await feedQueue(snap, false);
    }

    console.log(`[runner] Completed at ${new Date().toISOString()}`);
    process.exit(0);
  } catch (err) {
    console.error(`[runner] Fatal error: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }
}

await main();
