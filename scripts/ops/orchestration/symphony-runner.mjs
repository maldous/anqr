#!/usr/bin/env node

import {
  existsSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
  mkdirSync,
  appendFileSync,
  statSync,
} from "node:fs";
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
  RUNNER_MAX_TURNS,
  RUNNER_MAX_EXECUTION_MS,
  QUEUE_STATES,
  TARGET_MIN,
  RUNNER_STUCK_THRESHOLD_MS,
  HEARTBEAT_INTERVAL_MS,
  MAX_CONCURRENT_AGENTS,
} from "../symphony-config.mjs";
import { createLogger } from "../lib/logger.mjs";

const { logInfo, logWarn, logError, logDebug } = createLogger();
import { sendDiscordEmbed } from "../integrations/notifications/discord-webhook.mjs";
import { feedQueue, getQueueSnapshot } from "../symphony-queue-control.mjs";
import { recordLinearCompletion, recordProviderSuccess } from "../symphony-credit-gate.mjs";
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
  patchIssueState,
  recordCompletion,
  recordRetryEvent,
  calculateExponentialBackoff,
} from "../symphony-state.mjs";
import {
  runValidation,
  runGlobalPreflights,
  formatValidationFeedback,
  validationManifestHash,
} from "../symphony-validation.mjs";

import { getWorktreePath, isDiscordWorktree, isSymphonyWorktree } from "../core/worktree-config.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Auto-detect worktree: check if .git is a file (worktree) vs directory (main repo)
const cwd = process.cwd();
const gitPath = resolve(cwd, ".git");
let autoDetectedWorktreeId = null;

logDebug(`[worktree-debug] Starting worktree detection`);
logDebug(`[worktree-debug] cwd: ${cwd}`);
logDebug(`[worktree-debug] gitPath: ${gitPath}`);
logDebug(`[worktree-debug] gitPath exists: ${existsSync(gitPath)}`);

try {
  if (existsSync(gitPath)) {
    const gitStat = statSync(gitPath);
    const isFile = gitStat.isFile();
    const isDir = gitStat.isDirectory();
    logDebug(`[worktree-debug] .git isFile: ${isFile}, isDirectory: ${isDir}`);
    
    if (gitStat.isFile()) {
      // This is a worktree - extract the worktree name from the gitdir reference
      const gitContent = readFileSync(gitPath, "utf-8");
      logDebug(`[worktree-debug] .git content: ${gitContent.trim()}`);
      
      const match = gitContent.match(/gitdir:\s*(.+)/);
      if (match && match[1]) {
        const gitDir = match[1].trim();
        logDebug(`[worktree-debug] extracted gitdir: ${gitDir}`);
        
        // gitDir format: /path/to/repo/.git/worktrees/anqr-wt1
        const wtMatch = gitDir.match(/anqr-(wt\d+)$/);
        if (wtMatch) {
          autoDetectedWorktreeId = wtMatch[1];
          logDebug(`[worktree-debug] auto-detected worktree ID: ${autoDetectedWorktreeId}`);
        } else {
          logDebug(`[worktree-debug] gitdir did not match worktree pattern`);
        }
      } else {
        logDebug(`[worktree-debug] no gitdir found in .git file`);
      }
    } else {
      logDebug(`[worktree-debug] .git is a directory - running in main repo`);
    }
  }
} catch (err) {
  logError(`[worktree-debug] Error during worktree detection: ${err.message}`);
  // Ignore errors - will fall through to env var check
}

// Determine WORKTREE_ID: prioritize env var, then auto-detect, fail if neither
let WORKTREE_ID;
logDebug(`[worktree-debug] ANQR_WORKTREE_ID env var: ${process.env.ANQR_WORKTREE_ID || '(not set)'}`);
logDebug(`[worktree-debug] auto-detected ID: ${autoDetectedWorktreeId || '(none)'}`);

if (process.env.ANQR_WORKTREE_ID) {
  WORKTREE_ID = process.env.ANQR_WORKTREE_ID;
  logDebug(`[worktree-debug] Using WORKTREE_ID from env: ${WORKTREE_ID}`);
} else if (autoDetectedWorktreeId) {
  WORKTREE_ID = autoDetectedWorktreeId;
  logDebug(`[worktree-debug] Using auto-detected WORKTREE_ID: ${WORKTREE_ID}`);
} else {
  // Running in main repo without worktree context - NOT ALLOWED
  logError(
    `[runner] CRITICAL: Cannot run in main repo. Must run in a worktree (e.g., /home/user/src/anqr-wt1) or set ANQR_WORKTREE_ID environment variable.`,
  );
  logError(
    `[runner] Example: ANQR_WORKTREE_ID=wt1 node scripts/ops/orchestration/symphony-runner.mjs --once`,
  );
  process.exit(1);
}

const ROOT = process.env.ANQR_WORKTREE_PATH || getWorktreePath(WORKTREE_ID.replace(/^wt/, ""));
logDebug(`[worktree-debug] ANQR_WORKTREE_PATH env var: ${process.env.ANQR_WORKTREE_PATH || '(not set)'}`);
logDebug(`[worktree-debug] Final ROOT directory: ${ROOT}`);
logDebug(`[worktree-debug] ROOT exists: ${existsSync(ROOT)}`);
logDebug(`[worktree-debug] ROOT is directory: ${existsSync(ROOT) && statSync(ROOT).isDirectory()}`);

// Inline test: verify ROOT matches expected pattern
const expectedPattern = new RegExp(`anqr-wt\\d+$`);
const rootMatchesPattern = expectedPattern.test(ROOT);
logDebug(`[worktree-debug] ROOT matches worktree pattern: ${rootMatchesPattern}`);
if (!rootMatchesPattern && WORKTREE_ID !== 'main') {
  logWarn(`[worktree-debug] WARNING: ROOT directory '${ROOT}' does not match expected worktree pattern`);
}
const WORKFLOW_PATH = resolve(ROOT, "scripts/ops/symphony/WORKFLOW.md");

const uid = process.getuid?.() ?? 1000;
const STATE_DIR = `/run/user/${uid}/symphony-runner`;

// Ensure lock directory exists
if (!existsSync(STATE_DIR)) {
  mkdirSync(STATE_DIR, { recursive: true });
}

const LOCK_FILE = resolve(STATE_DIR, `lock-${WORKTREE_ID}`);
const RUN_ID = `run-${Date.now()}-${process.pid}`;
const SYNC_FAILURE_THRESHOLD = 3;
const SYNC_FAIL_COUNT_FILE = resolve(STATE_DIR, `sync-fail-${WORKTREE_ID}`);

// Load persisted sync failure count
let syncFailCount = 0;
try {
  if (existsSync(SYNC_FAIL_COUNT_FILE)) {
    syncFailCount = Number(readFileSync(SYNC_FAIL_COUNT_FILE, "utf-8").trim()) || 0;
  }
} catch {
  syncFailCount = 0;
}
const LEASE_TTL_MS = Number(
  process.env.ANQR_SYMPHONY_LEASE_MS || Math.max(RUNNER_STUCK_THRESHOLD_MS, 20 * 60 * 1000),
);
const SYMPHONY_BRIDGE_URL = process.env.SYMPHONY_BRIDGE_URL || "http://127.0.0.1:4319/v1";
const SYMPHONY_BRIDGE_MODEL = process.env.SYMPHONY_RUNNER_MODEL || "symphony/main";
const DEFAULT_ALLOWED_DIRTY_PATH_PATTERNS = [
  /^reports\/rag-index\//,
  /^reports\/symphony\/state\.json(?:\.lock)?$/,
  /^reports\/runtime-events\.log$/,
  /^reports\/notify\//,
  /^reports\/email-ingest\//,
  /^reports\/codebuff\//,
  /^reports\/doctor\.json$/,
  /^reports\/latest\.json$/,
  /^task_requests\/tasks\//,
];

function normalizeRepoPath(value) {
  return String(value || "")
    .replace(/\\/g, "/")
    .trim();
}

function parseAllowedDirtyPathEnv() {
  return String(process.env.ANQR_RUNNER_ALLOWED_DIRTY_PATHS || "")
    .split(",")
    .map((item) => normalizeRepoPath(item))
    .filter(Boolean);
}

function isAllowedDirtyPath(filePath) {
  const normalized = normalizeRepoPath(filePath);
  if (!normalized) return false;
  if (DEFAULT_ALLOWED_DIRTY_PATH_PATTERNS.some((pattern) => pattern.test(normalized))) return true;
  return parseAllowedDirtyPathEnv().some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix.replace(/\/+$/g, "")}/`),
  );
}

function getWorkingTreeEntries() {
  try {
    const status = execFileSync("git", ["status", "--porcelain"], { cwd: ROOT, encoding: "utf-8" });
    return status
      .split("\n")
      .map((line) => line.trimEnd())
      .filter(Boolean)
      .map((line) => {
        const xy = line.slice(0, 2);
        let file = line.slice(3).trim();
        if (file.includes(" -> ")) file = file.split(" -> ").pop().trim();
        const normalizedPath = normalizeRepoPath(file);
        return { status: xy, file: normalizedPath, allowed: isAllowedDirtyPath(normalizedPath) };
      });
  } catch {
    return [];
  }
}

function getWorkingTreeStatus() {
  const entries = getWorkingTreeEntries();
  return {
    entries,
    allowed: entries.filter((entry) => entry.allowed),
    blocked: entries.filter((entry) => !entry.allowed),
  };
}

function logWorkingTreeEntries(prefix, entries) {
  for (const entry of entries.slice(0, 25)) {
    logWarn(`${prefix} ${entry.status} ${entry.file}`);
  }
  if (entries.length > 25) {
    logWarn(`${prefix} ... and ${entries.length - 25} more`);
  }
}

function getRunnerProvider() {
  return {
    name: "symphony-bridge",
    model: SYMPHONY_BRIDGE_MODEL,
    baseUrl: SYMPHONY_BRIDGE_URL,
    apiKey: process.env.SYMPHONY_BRIDGE_API_KEY || "local-symphony",
    requiresSdk: false,
    useMaxCompletionTokens: false,
  };
}

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

function gitDiffNames() {
  return [...new Set(getWorkingTreeStatus().blocked.map((entry) => entry.file))];
}

function gitDiffStat() {
  try {
    const files = gitDiffNames();
    if (files.length === 0) return "";
    return execFileSync("git", ["diff", "--stat", "--", ...files], {
      cwd: ROOT,
      encoding: "utf-8",
    }).trim();
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
    logError(`[runner] Git revert failed: ${err.message}`);
    return false;
  }
}

function getRepoHeadSha(ref = "HEAD") {
  return execFileSync("git", ["rev-parse", ref], {
    cwd: ROOT,
    encoding: "utf-8",
  }).trim();
}

function writePreValidationPatch(changedFiles) {
  const patchFile = resolve(ROOT, ".git", `SYMPHONY_PREVALIDATION_${Date.now()}.patch`);
  const filesToCapture = [...new Set((changedFiles || []).map((file) => normalizeRepoPath(file)).filter(Boolean))];
  const args = ["diff", "--binary", "--full-index", "HEAD"];
  if (filesToCapture.length > 0) args.push("--", ...filesToCapture);
  const patch = execFileSync("git", args, {
    cwd: ROOT,
    encoding: "utf-8",
    stdio: "pipe",
  });
  writeFileSync(patchFile, patch, "utf-8");
  return patchFile;
}

function removeTempFile(filePath) {
  if (!filePath) return;
  try {
    unlinkSync(filePath);
  } catch {}
}

function syncWorktreeBeforeValidation(changedFiles) {
  const previousHead = getRepoHeadSha("HEAD");
  let patchFile = null;

  try {
    patchFile = writePreValidationPatch(changedFiles);
    execFileSync("git", ["reset", "--hard", "HEAD"], { cwd: ROOT, stdio: "pipe" });
    execFileSync("git", ["clean", "-fd"], { cwd: ROOT, stdio: "pipe" });
    execFileSync("git", ["fetch", "origin", "main"], { cwd: ROOT, stdio: "pipe" });
    execFileSync("git", ["merge", "origin/main", "--ff-only"], { cwd: ROOT, stdio: "pipe" });

    const patchSize = statSync(patchFile).size;
    if (patchSize > 0) {
      execFileSync("git", ["apply", "--index", "--3way", patchFile], {
        cwd: ROOT,
        stdio: "pipe",
      });
    }

    removeTempFile(patchFile);
    return { ok: true };
  } catch (err) {
    const stderr = err.stderr?.toString?.() || "";
    const stdout = err.stdout?.toString?.() || "";
    const conflictDetected =
      stderr.includes("CONFLICT") ||
      stdout.includes("CONFLICT") ||
      stderr.includes("patch does not apply") ||
      stdout.includes("patch does not apply") ||
      stderr.includes("could not build fake ancestor") ||
      stdout.includes("could not build fake ancestor");

    try {
      execFileSync("git", ["merge", "--abort"], { cwd: ROOT, stdio: "pipe" });
    } catch {}
    try {
      execFileSync("git", ["rebase", "--abort"], { cwd: ROOT, stdio: "pipe" });
    } catch {}
    try {
      execFileSync("git", ["reset", "--hard", previousHead], { cwd: ROOT, stdio: "pipe" });
      execFileSync("git", ["clean", "-fd"], { cwd: ROOT, stdio: "pipe" });
      if (patchFile && existsSync(patchFile) && statSync(patchFile).size > 0) {
        execFileSync("git", ["apply", patchFile], { cwd: ROOT, stdio: "pipe" });
      }
    } catch (error_) {
      logError(`[runner] Failed to restore pre-validation state: ${error_.message}`);
    } finally {
      removeTempFile(patchFile);
    }

    return { ok: false, conflictDetected, error: err };
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
    const filesToStage = [
      ...new Set((changedFiles || []).map((file) => normalizeRepoPath(file)).filter(Boolean)),
    ];
    if (filesToStage.length === 0) {
      throw new Error("No changed source files available to stage");
    }

    execFileSync("git", ["add", "--", ...filesToStage], { cwd: ROOT, stdio: "pipe" });
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
    logError(`[runner] Git commit failed: ${err.message}`);
    return false;
  }
}

async function gitPush() {
  const MAX_PUSH_RETRIES = 3;

  // Get current branch name for worktrees
  const currentBranch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
    cwd: ROOT,
    encoding: "utf-8",
  }).trim();

  for (let attempt = 1; attempt <= MAX_PUSH_RETRIES; attempt++) {
    try {
      if (WORKTREE_ID !== "main") {
        // FIXED: Push to worktree branch first to avoid race conditions
        // Step 1: Push current branch (e.g., symphony/wt1) to its remote branch
        // Use -u for first push to set upstream tracking
        const worktreeBranch = currentBranch || `symphony/${WORKTREE_ID}`;
        logInfo(`[runner] Pushing to worktree branch: origin ${worktreeBranch}`);
        execFileSync("git", ["push", "-u", "origin", `HEAD:${worktreeBranch}`], {
          cwd: ROOT,
          stdio: "pipe",
          timeout: 30_000,
        });

        // Step 2: Push to main (this should now work since we pushed to our branch first)
        logInfo(`[runner] Syncing to main...`);
        execFileSync("git", ["push", "origin", "HEAD:main"], {
          cwd: ROOT,
          stdio: "pipe",
          timeout: 30_000,
        });
      } else {
        // Main worktree: push to tracking branch (default behavior)
        execFileSync("git", ["push"], { cwd: ROOT, stdio: "pipe", timeout: 30_000 });
      }
      if (attempt > 1) {
        logInfo(`[runner] Git push succeeded on attempt ${attempt}/${MAX_PUSH_RETRIES}`);
      }
      return true;
    } catch (err) {
      if (attempt < MAX_PUSH_RETRIES) {
        // Check if it's a non-fast-forward error (race condition with another worktree)
        const stderr = err.stderr ? err.stderr.toString() : "";
        const isRaceCondition =
          err.message?.includes("non-fast-forward") ||
          err.message?.includes("rejected") ||
          stderr.includes("non-fast-forward") ||
          stderr.includes("rejected");

        if (isRaceCondition) {
          logWarn(
            `[runner] Push rejected (attempt ${attempt}/${MAX_PUSH_RETRIES}) - another worktree pushed first. Rebasing...`,
          );
          try {
            // Fetch latest and rebase our commit on top
            execFileSync("git", ["fetch", "origin", "main"], { cwd: ROOT, stdio: "pipe" });
            execFileSync("git", ["rebase", "origin/main"], { cwd: ROOT, stdio: "pipe" });
            logInfo(`[runner] Rebase successful, retrying push...`);
            // Continue to next attempt
          } catch (rebaseErr) {
            logError(`[runner] Rebase failed: ${rebaseErr.message}`);
            // Try to abort rebase and return failure
            try {
              execFileSync("git", ["rebase", "--abort"], { cwd: ROOT, stdio: "pipe" });
            } catch {}
            return false;
          }
        } else {
          logWarn(`[runner] Push failed (attempt ${attempt}/${MAX_PUSH_RETRIES}): ${err.message}`);
          // For non-race-condition errors, wait briefly and retry
          const waitMs = attempt * 1000; // 1s, 2s backoff
          logInfo(`[runner] Waiting ${waitMs}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, waitMs));
        }
      } else {
        logError(`[runner] Git push failed after ${MAX_PUSH_RETRIES} attempts: ${err.message}`);
        return false;
      }
    }
  }

  return false;
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
    logInfo("[runner] Baseline cache hit — skipping full pre-flights");
    return { pass: true, cached: true };
  }
  const result = runGlobalPreflights(ROOT);
  setGlobalValue("baseline.head", head);
  setGlobalValue("baseline.manifestHash", manifestHash);
  setGlobalValue("baseline.pass", Boolean(result.pass));
  setGlobalValue("baseline.checkedAt", new Date().toISOString());
  return result;
}

/**
 * Check if an issue originated from Discord
 */
function isDiscordIssue(issue) {
  const state = getIssueState(issue.identifier);
  const source = state.source || "";
  const isFromDiscord = source.toLowerCase().includes("discord");
  logDebug(`[worktree-routing] isDiscordIssue(${issue.identifier}) - source: '${source}', result: ${isFromDiscord}`);
  return isFromDiscord;
}

async function pickIssue({ excludeIds = new Set(), baselineOnly = false } = {}) {
  const todoIssues = await listIssuesByState(QUEUE_STATES.readyStates);
  
  logDebug(`[worktree-routing] pickIssue() called - WORKTREE_ID: ${WORKTREE_ID}, ROOT: ${ROOT}`);
  logDebug(`[worktree-routing] Total todo issues: ${todoIssues.length}`);
  logDebug(`[worktree-routing] Excluded IDs: ${excludeIds.size}`);
  logDebug(`[worktree-routing] Baseline only: ${baselineOnly}`);
  
  // IMPORTANT: Worktree routing to prevent concurrent conflicts
  // - Discord issues (wt5-wt8) are routed to Discord worktrees only
  // - Symphony issues (wt1-wt4, main) handle all other work
  const isDiscordWt = isDiscordWorktree(WORKTREE_ID);
  const isSymphonyWt = isSymphonyWorktree(WORKTREE_ID);
  
  logDebug(`[worktree-routing] This worktree - isDiscord: ${isDiscordWt}, isSymphony: ${isSymphonyWt}`);
  
  const candidates = todoIssues
    .filter((issue) => !excludeIds.has(issue.id))
    .filter((issue) => canExecuteIssue(issue))
    .filter((issue) => (baselineOnly ? isBaselineRepairIssue(issue) : true))
    .filter((issue) => {
      // Worktree routing based on issue source
      const fromDiscord = isDiscordIssue(issue);
      
      logDebug(`[worktree-routing] Evaluating issue ${issue.identifier} - fromDiscord: ${fromDiscord}`);
      
      // Discord worktrees (wt5-wt8) only handle Discord issues
      if (isDiscordWt && !fromDiscord) {
        logDebug(`[worktree-routing] ✗ Skipping non-Discord issue ${issue.identifier} (Discord worktree)`);
        return false;
      }
      
      // Symphony worktrees (wt1-wt4, main) only handle non-Discord issues
      if (isSymphonyWt && fromDiscord) {
        logDebug(`[worktree-routing] ✗ Skipping Discord issue ${issue.identifier} (Symphony worktree)`);
        return false;
      }
      
      logDebug(`[worktree-routing] ✓ Issue ${issue.identifier} matches worktree criteria`);
      return true;
    })
    .sort(
      (a, b) =>
        (a.priority ?? 99) - (b.priority ?? 99) || new Date(a.createdAt) - new Date(b.createdAt),
    );
  
  logDebug(`[worktree-routing] Candidate count after filtering: ${candidates.length}`);
  if (candidates.length > 0) {
    logDebug(`[worktree-routing] Selected issue: ${candidates[0].identifier}`);
  } else {
    logDebug(`[worktree-routing] No candidates available`);
  }
  
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
    logInfo(`[runner] Sonar post-commit complete for ${issueIdentifier}`);
  } catch (err) {
    logWarn(`[runner] Sonar post-commit scan failed (non-fatal): ${err.message}`);
  }
}

async function executeIssue(issue, dryRun = false) {
  // Worktree sync: ensure worktree is synced with main before starting
  // IMPORTANT: This happens BEFORE lease acquisition to avoid wasting lease cycles on sync failures
  if (WORKTREE_ID !== "main") {
    logDebug(`[worktree-sync] Starting sync for WORKTREE_ID: ${WORKTREE_ID}`);
    logDebug(`[worktree-sync] Sync working directory (ROOT): ${ROOT}`);
    logDebug(`[worktree-sync] Current sync failure count: ${syncFailCount}/${SYNC_FAILURE_THRESHOLD}`);
    
    try {
      logInfo(`[runner] 🔄 Syncing worktree ${WORKTREE_ID} with main...`);
      logDebug(`[worktree-sync] Executing: git fetch origin main (cwd: ${ROOT})`);
      execFileSync("git", ["fetch", "origin", "main"], { cwd: ROOT, stdio: "pipe" });
      
      logDebug(`[worktree-sync] Executing: git merge origin/main --ff-only (cwd: ${ROOT})`);
      execFileSync("git", ["merge", "origin/main", "--ff-only"], { cwd: ROOT, stdio: "pipe" });
      logInfo(`[runner] ✅ Worktree ${WORKTREE_ID} synced with main`);
      logDebug(`[worktree-sync] Sync successful`);
      
      // Reset failure counter on successful sync
      syncFailCount = 0;
      try {
        if (existsSync(SYNC_FAIL_COUNT_FILE)) {
          unlinkSync(SYNC_FAIL_COUNT_FILE);
        }
      } catch {}
    } catch (err) {
      // Sync failed - release lock immediately and exit to avoid wasting lease cycles
      syncFailCount++;
      
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
      const isConflict = stderr.includes("conflict") || stdout.includes("conflict") || 
                        stderr.includes("CONFLICT") || stdout.includes("CONFLICT");
      
      if (isConflict) {
        logError(`[runner] Detected merge conflict - divergent changes exist in worktree`);
      } else {
        logError(`[runner] Sync error type: ${err.code || 'unknown'}`);
      }
      
      logError(`[runner] ⏭️  Releasing lock and exiting immediately to avoid wasting lease acquisition cycle.`);

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
          syncFailCount = 0;
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
          logError(`[runner] Recovery command: cd ${ROOT} && git reset --hard origin/main && git clean -fd`);
          
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
        to: "Abandoned",
        runId: RUN_ID,
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

      // Handle provider failures (LLM call failed, no choices, etc.) with exponential backoff
      if (failureKind === "provider") {
        const currentState = getIssueState(issue.identifier);
        const cooldownMs = calculateExponentialBackoff(currentState.retry_count || 0);
        
        await updateIssue(issue.id, { stateId: STATES.todo });
        setCooldown(issue.identifier, cooldownMs, "provider_failure");
        
        // Record retry event for evidence
        recordRetryEvent(issue.identifier, {
          type: "failure",
          provider: metricsProviderName,
          reason: "provider_failure",
          cooldown_ms: cooldownMs,
          error: failureMsg.slice(0, 200),
        });
        
        await addComment(
          issue.id,
          `🔴 **Provider failure** — returned to Todo with exponential backoff (${Math.round(cooldownMs / 60000)}min).\n\nAttempt: ${attempt}/${RUNNER_MAX_RETRIES}\nError: ${failureMsg.slice(0, 500)}`,
        );
        recordTransition(issue.identifier, {
          actor: "runner",
          reason: "provider_failure",
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

      // Handle quota/rate-limit failures with exponential backoff (longer base)
      if (failureKind === "quota") {
        const currentState = getIssueState(issue.identifier);
        // Use longer base for quota failures (15min base instead of 10min)
        const cooldownMs = calculateExponentialBackoff(currentState.retry_count || 0, 15 * 60 * 1000);
        
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
            to: "Abandoned",
            runId: RUN_ID,
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

      // NEW: Check if agent reports completion even with no file changes
      // This handles cases where agent verified issue is already fixed, duplicate, or resolved without changes
      if (agentResult.completed === true && !isExternallyCompleted) {
        await updateIssue(issue.id, { stateId: STATES.done });
        await addComment(
          issue.id,
          `✅ **Completed by agent** — no file changes required, but agent reported successful completion.\n\nAgent summary: ${agentResult.summary}`,
        );
        recordTransition(issue.identifier, {
          actor: "runner",
          reason: "agent_completed_no_changes",
          from: "In Progress",
          to: "Done",
          runId: RUN_ID,
        });
        // Track as successful completion (agent completed work even without file changes)
        if (provider?.name) {
          recordLinearCompletion(metricsProviderName, {
            completed: true,
            priority: issue.priority,
            estimate: issue.estimate,
          });
          recordProviderSuccess(metricsProviderName);
        }
        clearCooldown(issue.identifier);
        logInfo(`[runner] ✅ Completed: ${issue.identifier} — ${issue.title} (agent completed, no changes needed)`);
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
      logWarn(`[runner] Validation aborted due to heartbeat failure for ${issue.identifier}`);
      gitRevert();
      recordTransition(issue.identifier, {
        actor: "runner",
        reason: "lease_lost_during_validation",
        from: "In Progress",
        to: "Abandoned",
        runId: RUN_ID,
      });
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
        to: "Abandoned",
        runId: RUN_ID,
      });
      return "done";
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
        // Track validation failure (exhausted)
        recordLinearCompletion(metricsProviderName, {
          completed: false,
          priority: issue.priority,
          estimate: issue.estimate,
        });
      } else {
        const valSignature = `validation_failed:${validation.signature || "unknown"}`;
        if (priorFailureSignature === valSignature) {
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
        } else {
          setCooldown(
            issue.identifier,
            RUNNER_ISSUE_COOLDOWN_MS,
            "validation_failed",
            valSignature,
          );
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
        // Track Linear issue failure
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
      gitRevert();
      const gcfSignature = "git_commit_failed";
      if (priorFailureSignature === gcfSignature) {
        markRetryExhausted(issue.identifier, {
          reason: "git_commit_failed_repeated",
          signature: gcfSignature,
        });
        await updateIssue(issue.id, { stateId: STATES.backlog });
        await addComment(issue.id, "🚫 **Git commit failed (repeated)** — quarantined to Backlog.");
        recordTransition(issue.identifier, {
          actor: "runner",
          reason: "git_commit_failed_repeated",
          from: "In Progress",
          to: "Backlog",
          runId: RUN_ID,
        });
      } else {
        setCooldown(issue.identifier, RUNNER_ISSUE_COOLDOWN_MS, "git_commit_failed", gcfSignature);
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
    let pushConfirmed = false;
    if (RUNNER_AUTO_PUSH) {
      pushConfirmed = await gitPush();
      if (pushConfirmed) {
        finalStateId = STATES.done;
        finalStateName = "Done";
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
    ].join("\n");

    await addComment(issue.id, completionComment);

    const commitHash = execFileSync("git", ["rev-parse", "--short", "HEAD"], {
      cwd: ROOT,
      encoding: "utf-8",
    }).trim();

    // Send single consolidated Discord notification on completion
    // Get queue snapshot for concurrent runner context
    const queueSnap = await getQueueSnapshot();
    const activeRunners = queueSnap.inProgress.automatable.length;
    const maxRunners = MAX_CONCURRENT_AGENTS;
    const worktreeValue = `${WORKTREE_ID} (${activeRunners}/${maxRunners} active)`;
    const queueValue = `${queueSnap.readyDepth} issues ready`;

    await sendDiscordEmbed({
      title: `${issue.identifier} | ${WORKTREE_ID}`,
      description: issue.title,
      color: finalStateId === STATES.done ? 0x00ff00 : 0xffa500, // Green for Done, Orange for In Review
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
      reason: pushConfirmed ? "push_confirmed" : "local_commit_complete",
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
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    releaseLease(issue.identifier, leaseNonce);
  }
}

function showStatus() {
  logInfo("[runner] Symphony Runner Status\n");
  logInfo(`  Worktree: ${WORKTREE_ID}`);
  logInfo(`  Root: ${ROOT}`);
  if (existsSync(LOCK_FILE)) {
    const pid = readFileSync(LOCK_FILE, "utf-8").trim();
    logInfo(`  Lock: ${isProcessAlive(Number(pid)) ? "🔒 LOCKED" : "🔓 stale"} (PID ${pid})`);
  } else {
    logInfo("  Lock: 🔓 available");
  }
  const workingTree = getWorkingTreeStatus();
  if (workingTree.blocked.length === 0 && workingTree.allowed.length === 0) {
    logInfo(`  Git clean: ✅`);
  } else if (workingTree.blocked.length === 0) {
    logInfo(
      `  Git clean: ⚠️ runtime-generated dirty paths ignored (${workingTree.allowed.length})`,
    );
  } else {
    logInfo(`  Git clean: ❌ (${workingTree.blocked.length} blocking path(s))`);
  }
  logInfo(`  LINEAR_API_KEY: ${process.env.LINEAR_API_KEY ? "✅" : "❌ not set"}`);
  logInfo(`  Run ID: ${RUN_ID}`);
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
    logError("Usage: symphony-runner.mjs --once [--dry-run] | --status");
    process.exit(2);
  }
  logInfo(`[runner]${dryRun ? " (DRY RUN)" : ""} starting at ${new Date().toISOString()}`);
  logInfo(`[runner] Worktree: ${WORKTREE_ID}, Root: ${ROOT}`);
  
  // Debug: Verify directory variables
  logDebug(`[worktree-verify] ========== WORKTREE DIRECTORY VERIFICATION ==========`);
  logDebug(`[worktree-verify] process.cwd(): ${process.cwd()}`);
  logDebug(`[worktree-verify] ROOT: ${ROOT}`);
  logDebug(`[worktree-verify] WORKTREE_ID: ${WORKTREE_ID}`);
  logDebug(`[worktree-verify] ROOT === process.cwd(): ${ROOT === process.cwd()}`);
  
  // Inline test: Verify they're different for worktrees
  if (WORKTREE_ID !== 'main' && ROOT === process.cwd()) {
    logWarn(`[worktree-verify] ⚠️ WARNING: ROOT equals process.cwd() - worktree separation may not be working!`);
  } else if (WORKTREE_ID !== 'main') {
    logDebug(`[worktree-verify] ✓ ROOT differs from process.cwd() - worktree separation active`);
  }
  
  // Test: Verify working directory
  try {
    const gitTopLevel = execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: ROOT, encoding: 'utf-8' }).trim();
    logDebug(`[worktree-verify] Git top-level directory: ${gitTopLevel}`);
    logDebug(`[worktree-verify] gitTopLevel === ROOT: ${gitTopLevel === ROOT}`);
  } catch (err) {
    logError(`[worktree-verify] Failed to get git top-level: ${err.message}`);
  }
  
  // Test: List actual worktrees
  try {
    const worktreeList = execFileSync('git', ['worktree', 'list', '--porcelain'], { cwd: ROOT, encoding: 'utf-8' });
    logDebug(`[worktree-verify] Git worktree list:\n${worktreeList}`);
  } catch (err) {
    logError(`[worktree-verify] Failed to list worktrees: ${err.message}`);
  }
  logDebug(`[worktree-verify] ====================================================`);
  
  // Log worktree routing configuration
  if (isDiscordWorktree(WORKTREE_ID)) {
    logInfo(`[runner] 🎮 Discord worktree mode: handling ONLY Discord-sourced issues`);
  } else if (isSymphonyWorktree(WORKTREE_ID)) {
    logInfo(`[runner] 🎼 Symphony worktree mode: handling non-Discord issues`);
  } else {
    logWarn(`[runner] ⚠️ Unknown worktree type: ${WORKTREE_ID} - will handle all issues`);
  }
  
  if (!process.env.LINEAR_API_KEY) {
    logError("[runner] LINEAR_API_KEY is not set");
    process.exit(1);
  }
  if (!acquireLock()) {
    logInfo("[runner] Another runner instance is active — exiting");
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
    const workingTree = getWorkingTreeStatus();
    if (workingTree.allowed.length > 0) {
      logWarn(
        `[runner] Ignoring ${workingTree.allowed.length} allowed runtime-generated dirty path(s)`,
      );
      logWorkingTreeEntries("[runner] allowed-dirty", workingTree.allowed);
    }
    if (workingTree.blocked.length > 0) {
      logError(
        `[runner] Git working tree is dirty — refusing to run in a shared or unsafe worktree (${workingTree.blocked.length} blocking path(s))`,
      );
      logWorkingTreeEntries("[runner] blocking-dirty", workingTree.blocked);
      process.exit(1);
    }

    const preflight = dryRun ? { pass: true } : await maybeRunPreflights();
    const baselineOnly = !preflight.pass;
    if (!preflight.pass) {
      logWarn(
        `[runner] Baseline pre-flight ${preflight.check} failed — only baseline-repair issues may run this cycle`,
      );
    }

    if (!dryRun) {
      // FIRST: Clean up expired leases and recover stale In Progress issues BEFORE picking new work
      const { findExpiredLeases } = await import("../symphony-state.mjs");
      const expiredLeases = findExpiredLeases();
      for (const { issueIdentifier } of expiredLeases) {
        logInfo(`[runner] Clearing expired lease for ${issueIdentifier}`);
        const { releaseLease } = await import("../symphony-state.mjs");
        releaseLease(issueIdentifier);
      }

      // Now check for stale In Progress issues - recover them to Todo so they can be picked up
      const snap = await getQueueSnapshot();
      if (snap.inProgress.all.length > 0) {
        logInfo(`[runner] Checking for stale In Progress issues...`);
        const { detectStuckWork } = await import("./symphony-queue-control.mjs");
        await detectStuckWork(snap, false);
      }

      // Now check if we need to feed more issues from Backlog
      // CRITICAL: Use readyDepth (Todo count), not queueDepth (includes In Progress)
      // Runners pick from Todo only, so that's what matters
      const freshSnap = await getQueueSnapshot();
      if (freshSnap.readyDepth < TARGET_MIN) await feedQueue(freshSnap, false);
    }

    // SECOND: Pick and execute issues (now with recovered issues in Todo)
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
      // After completing an issue (success or handled outcome), feed queue to eliminate idle gap
      // CRITICAL: Use readyDepth (Todo count), not queueDepth (includes In Progress)
      const snap = await getQueueSnapshot();
      if (snap.readyDepth < TARGET_MIN) await feedQueue(snap, false);
      executed = true;
    }

    // After processing (whether an issue was executed or not), feed to keep queue topped up and eliminate idle gap
    // CRITICAL: Use readyDepth (Todo count), not queueDepth (includes In Progress)
    if (!dryRun) {
      const finalSnap = await getQueueSnapshot();
      if (finalSnap.readyDepth < TARGET_MIN) await feedQueue(finalSnap, false);
    }

    if (!executed) {
      logInfo(`[runner] No eligible issues found for execution`);
    }
    logInfo(`[runner] Run completed at ${new Date().toISOString()}`);
    process.exit(0);
  } catch (err) {
    logError(`[runner] Fatal error: ${err.message}`);
    logError(err.stack);
    process.exit(1);
  }
}

await main();
