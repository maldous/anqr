#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * symphony-runner.mjs — Symphony execution orchestrator
 *
 * Follows the OpenAI Symphony spec: poll Linear → pick issue → execute
 * agent → validate → accept (commit + mark Done) or reject (revert).
 *
 * Modes:
 *   --once      Run one cycle: pick a Todo issue, execute, exit
 *   --dry-run   Preview what would happen without making changes
 *   --status    Show runner state and exit
 *
 * Designed to run as a systemd oneshot service via anqr-symphony-runner.timer.
 *
 * Legacy lessons:
 *   - PID lock prevents overlapping runs (Ollama is single-slot)
 *   - Git tree must be clean before execution
 *   - Revert on failure — never leave broken code in the repo
 *   - Track attempts via Linear comments to enforce retry limits
 *   - Commit locally; push is configurable (default: off)
 *
 * Usage:
 *   LINEAR_API_KEY=... node scripts/ops/symphony-runner.mjs --once
 *   LINEAR_API_KEY=... node scripts/ops/symphony-runner.mjs --once --dry-run
 *   node scripts/ops/symphony-runner.mjs --status
 *
 * Exit codes:
 *   0 = completed (success, no work, or dry-run)
 *   1 = error
 */

import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  listIssuesByState,
  updateIssue,
  addComment,
  updateComment,
  getIssueDetail,
  STATES,
} from './linear-client.mjs';
import {
  RUNNER_MAX_RETRIES,
  RUNNER_COMMIT_PREFIX,
  RUNNER_AUTO_PUSH,
  RUNNER_STUCK_THRESHOLD_MS,
  QUEUE_STATES,
  TARGET_MIN,
} from './symphony-config.mjs';
import { feedQueue, getQueueSnapshot } from './symphony-queue-control.mjs';
import { selectProvider, recordProviderFailure } from './symphony-credit-gate.mjs';
import { runAgent } from './symphony-agent.mjs';
import { sendNotification, linearIssueUrl } from './lib/notify.mjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const WORKFLOW_PATH = resolve(ROOT, 'scripts/ops/symphony/WORKFLOW.md');

const uid = process.getuid?.() ?? 1000;
const STATE_DIR = `/run/user/${uid}/symphony-runner`;
const LOCK_FILE = resolve(STATE_DIR, 'lock');

// ---------------------------------------------------------------------------
// PID lock
// ---------------------------------------------------------------------------

function acquireLock() {
  if (!existsSync(STATE_DIR)) {
    mkdirSync(STATE_DIR, { recursive: true, mode: 0o700 });
  }

  if (existsSync(LOCK_FILE)) {
    const existingPid = parseInt(readFileSync(LOCK_FILE, 'utf-8').trim(), 10);
    if (existingPid && isProcessAlive(existingPid)) {
      return false;
    }
    unlinkSync(LOCK_FILE);
  }

  writeFileSync(LOCK_FILE, String(process.pid));
  return true;
}

function releaseLock() {
  try {
    if (existsSync(LOCK_FILE)) {
      const pid = parseInt(readFileSync(LOCK_FILE, 'utf-8').trim(), 10);
      if (pid === process.pid) {
        unlinkSync(LOCK_FILE);
      }
    }
  } catch { /* best effort */ }
}

function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Git operations
// ---------------------------------------------------------------------------

function gitIsClean() {
  try {
    const status = execSync('git status --porcelain', { cwd: ROOT, encoding: 'utf-8' });
    return status.trim().length === 0;
  } catch {
    return false;
  }
}

function gitDiffNames() {
  try {
    const diff = execSync('git diff --name-only', { cwd: ROOT, encoding: 'utf-8' });
    const untracked = execSync('git ls-files --others --exclude-standard', { cwd: ROOT, encoding: 'utf-8' });
    return [...diff.trim().split('\n'), ...untracked.trim().split('\n')].filter(Boolean);
  } catch {
    return [];
  }
}

function gitDiffStat() {
  try {
    return execSync('git diff --stat', { cwd: ROOT, encoding: 'utf-8' }).trim();
  } catch {
    return '';
  }
}

function gitRevert() {
  try {
    execSync('git checkout -- .', { cwd: ROOT, stdio: 'pipe' });
    execSync('git clean -fd', { cwd: ROOT, stdio: 'pipe' });
    return true;
  } catch (err) {
    console.error(`[runner] Git revert failed: ${err.message}`);
    return false;
  }
}

function gitCommit(issueIdentifier, issueTitle, summary) {
  try {
    execSync('git add -A', { cwd: ROOT, stdio: 'pipe' });
    const msg = `${RUNNER_COMMIT_PREFIX}: ${issueTitle} (${issueIdentifier})\n\n${summary}`;
    execSync(`git commit -m ${JSON.stringify(msg)}`, { cwd: ROOT, stdio: 'pipe' });
    return true;
  } catch (err) {
    console.error(`[runner] Git commit failed: ${err.message}`);
    return false;
  }
}

function gitPush() {
  try {
    execSync('git push', { cwd: ROOT, stdio: 'pipe', timeout: 30_000 });
    return true;
  } catch (err) {
    console.error(`[runner] Git push failed: ${err.message}`);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Validation pipeline
// ---------------------------------------------------------------------------

const TSC_CMD = 'npx tsc --noEmit';
const TSC_EXEC_OPTIONS = { cwd: ROOT, timeout: 120_000, stdio: 'pipe', env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=2048' } };

function runTypecheck() {
  try {
    execSync(TSC_CMD, TSC_EXEC_OPTIONS);
    return { pass: true, detail: '' };
  } catch (err) {
    const stdout = (err.stdout || '').toString();
    const stderr = (err.stderr || '').toString();
    const output = (stdout + '\n' + stderr).trim().slice(0, 2000);
    return { pass: false, detail: output };
  }
}

function runValidation() {
  const results = [];

  // Typecheck
  const tc = runTypecheck();
  results.push({ check: 'typecheck', ...tc });

  // Unit tests
  try {
    execSync(
      "NODE_OPTIONS='--no-experimental-webstorage' npx vitest run --maxWorkers=100% --exclude 'tests/unit/gallery-scan-matrix.spec.ts' --exclude 'tests/unit/overlay-preservation-mode-audit.spec.ts' --exclude 'tests/unit/qr-generator-perf-profile.spec.ts'",
      { cwd: ROOT, timeout: 120_000, stdio: 'pipe', env: { ...process.env, ANQR_LOG_LEVEL: 'error' } },
    );
    results.push({ check: 'test-unit', pass: true, detail: '' });
  } catch (err) {
    const stdout = (err.stdout || '').toString();
    const stderr = (err.stderr || '').toString();
    const output = (stdout + '\n' + stderr).trim().slice(0, 2000);
    results.push({ check: 'test-unit', pass: false, detail: output });
  }

  const passed = results.every((r) => r.pass);
  return { passed, results };
}

// ---------------------------------------------------------------------------
// Attempt counting
// ---------------------------------------------------------------------------

function countPreviousAttempts(issue) {
  const comments = issue.comments?.nodes || [];
  return comments.filter((c) => c.body.includes('🤖 Symphony agent starting')).length;
}

// ---------------------------------------------------------------------------
// Stuck-in-progress recovery
// ---------------------------------------------------------------------------

async function recoverStuckIssues() {
  const inProgress = await listIssuesByState(QUEUE_STATES.activeStates);
  if (inProgress.length === 0) return;

  const now = Date.now();
  let recovered = 0;

  for (const issue of inProgress) {
    const updatedMs = new Date(issue.updatedAt).getTime();
    const staleMs = now - updatedMs;

    if (staleMs < RUNNER_STUCK_THRESHOLD_MS) {
      console.log(`[runner] ${issue.identifier} in progress — updated ${Math.round(staleMs / 60_000)}min ago, not stuck`);
      continue;
    }

    // Only recover issues the runner put In Progress (not human-managed ones)
    const detail = await getIssueDetail(issue.id);
    const comments = detail?.comments?.nodes || [];
    const ownedByRunner = comments.some((c) => c.body.includes('🤖 Symphony agent starting'));
    if (!ownedByRunner) {
      console.log(`[runner] ${issue.identifier} in progress but not runner-owned — skipping`);
      continue;
    }

    const staleMin = Math.round(staleMs / 60_000);
    console.log(`[runner] ${issue.identifier} stuck in progress (${staleMin}min stale) — recovering to Todo`);

    await addComment(
      issue.id,
      `⚠️ **Stuck-in-progress recovery** — issue was In Progress for ${staleMin}min with no activity. Previous runner likely killed mid-execution. Moving back to Todo for retry.`,
    );
    await updateIssue(issue.id, { stateId: STATES.todo });

    sendNotification({
      subject: `Symphony recovered stuck issue: ${issue.identifier}`,
      body: `${issue.identifier} was stuck In Progress for ${staleMin}min with no update. Moved back to Todo.\n\n${linearIssueUrl(issue.identifier)}`,
      severity: 'warn',
    });

    recovered++;
  }

  if (recovered > 0) {
    console.log(`[runner] Recovered ${recovered} stuck issue(s)`);
  }
}

// ---------------------------------------------------------------------------
// Issue selection
// ---------------------------------------------------------------------------

function isAutomatable(issue) {
  return !issue.title.includes('[HUMAN]');
}

async function pickIssue() {
  const todoIssues = await listIssuesByState(QUEUE_STATES.readyStates);
  const automatable = todoIssues.filter(isAutomatable);

  if (automatable.length === 0) return null;

  automatable.sort((a, b) => a.priority - b.priority);
  return automatable[0];
}

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

function showStatus() {
  console.log('[runner] Symphony Runner Status\n');

  if (existsSync(LOCK_FILE)) {
    const pid = readFileSync(LOCK_FILE, 'utf-8').trim();
    const alive = isProcessAlive(parseInt(pid, 10));
    console.log(`  Lock: ${alive ? '🔒 LOCKED' : '🔓 stale'} (PID ${pid})`);
  } else {
    console.log('  Lock: 🔓 available');
  }

  console.log(`  Git clean: ${gitIsClean() ? '✅' : '❌'}`);
  console.log(`  WORKFLOW.md: ${existsSync(WORKFLOW_PATH) ? '✅' : '❌ MISSING'}`);
  console.log(`  LINEAR_API_KEY: ${process.env.LINEAR_API_KEY ? '✅' : '❌ not set'}`);
  console.log(`  State dir: ${STATE_DIR}`);
}

// ---------------------------------------------------------------------------
// Main execution
// ---------------------------------------------------------------------------

async function executeIssue(issue, dryRun) {
  const detail = await getIssueDetail(issue.id);
  if (!detail) {
    console.error(`[runner] Could not fetch detail for ${issue.identifier}`);
    return;
  }

  const attempt = countPreviousAttempts(detail) + 1;
  console.log(`[runner] Attempt ${attempt}/${RUNNER_MAX_RETRIES} for ${issue.identifier}: ${issue.title}`);

  if (attempt > RUNNER_MAX_RETRIES) {
    console.log(`[runner] Max retries (${RUNNER_MAX_RETRIES}) exceeded — demoting to Backlog`);
    if (!dryRun) {
      await updateIssue(issue.id, { stateId: STATES.backlog });
      await addComment(
        issue.id,
        `🚫 **Max retries exceeded** (${RUNNER_MAX_RETRIES} attempts). Moving to Backlog. This issue may need decomposition into smaller tasks.`,
      );
    }
    return;
  }

  // Early typecheck gate — fail fast before burning agent tokens or an attempt
  if (!dryRun) {
    // Skip if a recent pre-flight failure comment exists (avoid spamming every timer fire)
    const recentComments = detail.comments?.nodes || [];
    const hasRecentGateFailure = recentComments.some((c) => {
      if (!c.body.includes('⛔ **Pre-flight typecheck failed**')) return false;
      const commentAge = Date.now() - new Date(c.createdAt).getTime();
      return commentAge < 60 * 60 * 1000; // 60 min window
    });

    if (hasRecentGateFailure) {
      console.log('[runner] Recent pre-flight failure exists — skipping until 60min cooldown expires');
      return;
    }

    console.log('[runner] Running pre-flight typecheck...');
    const baseline = runTypecheck();
    if (!baseline.pass) {
      console.error('[runner] Baseline typecheck failed — skipping agent execution');
      await addComment(
        issue.id,
        [
          `⛔ **Pre-flight typecheck failed** — codebase does not typecheck before agent execution. Skipping to avoid wasting tokens.`,
          '',
          '```',
          baseline.detail.slice(0, 1500),
          '```',
          '',
          'Fix the baseline type errors first. This does not count as an attempt.',
        ].join('\n'),
      );
      sendNotification({
        subject: `Symphony skipped: ${issue.identifier} — baseline typecheck failed`,
        body: `Pre-flight typecheck failed for ${issue.identifier}. Agent execution skipped (attempt not consumed).\n\n${baseline.detail.slice(0, 500)}\n\n${linearIssueUrl(issue.identifier)}`,
        severity: 'warn',
      });
      return;
    }
    console.log('[runner] Pre-flight typecheck passed ✅');
  }

  // Move to In Progress + post starting comment (counts toward attempt tracking)
  let startingCommentId = null;
  if (!dryRun) {
    await updateIssue(issue.id, { stateId: STATES.inProgress });
    const startComment = await addComment(
      issue.id,
      `🤖 **Symphony agent starting** (Attempt ${attempt}/${RUNNER_MAX_RETRIES})\n\nSelecting provider...`,
    );
    startingCommentId = startComment.id;
  }
  console.log(`[runner] Moved ${issue.identifier} to In Progress${dryRun ? ' (dry-run: skipped)' : ''}`);

  // Select provider via credit gate
  const provider = await selectProvider();
  if (!provider) {
    console.error('[runner] No provider available — all providers exhausted');
    if (!dryRun) {
      await updateIssue(issue.id, { stateId: STATES.todo });
      await addComment(issue.id, '❌ **No LLM provider available** — all providers exhausted or failed. Will retry on next cycle.');
      sendNotification({
        subject: `Symphony error: no provider for ${issue.identifier}`,
        body: `All LLM providers exhausted or failed for ${issue.identifier}: ${issue.title}\n\n${linearIssueUrl(issue.identifier)}`,
        severity: 'warn',
      });
    }
    return;
  }
  console.log(`[runner] Selected provider: ${provider.name} (${provider.model})`);

  // Update starting comment in-place with provider info + send email
  if (!dryRun) {
    if (startingCommentId) {
      await updateComment(
        startingCommentId,
        `🤖 **Symphony agent starting** (Attempt ${attempt}/${RUNNER_MAX_RETRIES})\n\n**Provider:** ${provider.name} (${provider.model})`,
      );
    }
    sendNotification({
      subject: `Symphony starting: ${issue.identifier} — ${issue.title}`,
      body: [
        `Issue ${issue.identifier} moved to In Progress (Attempt ${attempt}/${RUNNER_MAX_RETRIES}).`,
        '',
        `Title: ${issue.title}`,
        `Priority: P${issue.priority}`,
        `Provider: ${provider.name} (${provider.model})`,
        `URL: ${linearIssueUrl(issue.identifier)}`,
      ].join('\n'),
      severity: 'info',
    });
  }

  if (dryRun) {
    console.log('[runner] DRY RUN — would execute agent, validate, and commit');
    return;
  }

  // Load system prompt
  let systemPrompt = 'You are a coding agent. Implement the requested changes.';
  if (existsSync(WORKFLOW_PATH)) {
    systemPrompt = readFileSync(WORKFLOW_PATH, 'utf-8');
  } else {
    console.warn('[runner] WORKFLOW.md not found — using default system prompt');
  }

  // Run agent
  console.log(`[runner] Starting agent execution...`);
  let agentResult;
  try {
    agentResult = await runAgent({
      provider,
      issue: detail,
      projectRoot: ROOT,
      systemPrompt,
    });
  } catch (err) {
    console.error(`[runner] Agent execution failed: ${err.message}`);
    recordProviderFailure(provider.name);
    gitRevert();
    await updateIssue(issue.id, { stateId: STATES.todo });
    await addComment(issue.id, `❌ **Agent execution error**\n\n\`\`\`\n${err.message}\n\`\`\`\n\nReverted. Will retry on next cycle.`);
    sendNotification({
      subject: `Symphony agent error: ${issue.identifier}`,
      body: `Agent execution failed for ${issue.identifier}: ${issue.title}\n\nError: ${err.message}\n\nReverted and left in Todo.\n${linearIssueUrl(issue.identifier)}`,
      severity: 'critical',
    });
    return;
  }

  console.log(`[runner] Agent finished: completed=${agentResult.completed}, turns=${agentResult.turns}, toolCalls=${agentResult.toolCalls}, files=${agentResult.filesChanged.length}`);

  // Check if files were changed
  const changedFiles = gitDiffNames();
  if (changedFiles.length === 0) {
    console.log('[runner] No files changed — nothing to validate or commit');
    await updateIssue(issue.id, { stateId: STATES.todo });
    await addComment(
      issue.id,
      `⚠️ **No file changes produced** (Attempt ${attempt}/${RUNNER_MAX_RETRIES})\n\nAgent summary: ${agentResult.summary}\nTurns: ${agentResult.turns}, Tool calls: ${agentResult.toolCalls}\n\nLeft in Todo for retry.`,
    );
    return;
  }

  console.log(`[runner] Files changed: ${changedFiles.join(', ')}`);

  // Run validation
  console.log('[runner] Running validation pipeline...');
  const validation = runValidation();

  if (validation.passed) {
    // Accept: commit + mark Done
    console.log('[runner] Validation passed ✅');

    const diffStat = gitDiffStat();
    const committed = gitCommit(issue.identifier, issue.title, agentResult.summary);

    if (!committed) {
      console.error('[runner] Commit failed — reverting');
      gitRevert();
      await updateIssue(issue.id, { stateId: STATES.todo });
      await addComment(issue.id, '❌ **Git commit failed** after successful validation. Reverted. Will retry.');
      sendNotification({
        subject: `Symphony commit failed: ${issue.identifier}`,
        body: `Git commit failed after successful validation for ${issue.identifier}: ${issue.title}\n\nReverted.\n${linearIssueUrl(issue.identifier)}`,
        severity: 'warn',
      });
      return;
    }

    if (RUNNER_AUTO_PUSH) {
      gitPush();
    }

    await updateIssue(issue.id, { stateId: STATES.done });

    const evidence = [
      `✅ **Symphony agent completed** (Attempt ${attempt}/${RUNNER_MAX_RETRIES})`,
      '',
      `**Provider:** ${provider.name} (${provider.model})`,
      `**Turns:** ${agentResult.turns}`,
      `**Tool calls:** ${agentResult.toolCalls}`,
      `**Files changed:** ${changedFiles.length}`,
      '',
      '### Agent Summary',
      agentResult.summary,
      '',
      '### Diff',
      '```',
      diffStat,
      '```',
      '',
      '### Validation',
      ...validation.results.map((r) => `- ${r.pass ? '✅' : '❌'} ${r.check}`),
      '',
      `---`,
      `*Auto-committed by symphony-runner.mjs${RUNNER_AUTO_PUSH ? ' (pushed)' : ''}*`,
    ];

    await addComment(issue.id, evidence.join('\n'));
    console.log(`[runner] ${issue.identifier} → Done ✅`);
  } else {
    // Reject: revert + comment
    console.log('[runner] Validation failed ❌');

    const failureDetail = validation.results
      .filter((r) => !r.pass)
      .map((r) => `### ${r.check}\n\`\`\`\n${r.detail.slice(0, 1000)}\n\`\`\``)
      .join('\n\n');

    gitRevert();
    console.log('[runner] Changes reverted');

    const targetState = attempt >= RUNNER_MAX_RETRIES ? STATES.backlog : STATES.todo;
    const targetLabel = attempt >= RUNNER_MAX_RETRIES ? 'Backlog (needs decomposition)' : 'Todo (will retry)';

    sendNotification({
      subject: `Symphony validation failed: ${issue.identifier}`,
      body: [
        `Validation failed for ${issue.identifier}: ${issue.title} (Attempt ${attempt}/${RUNNER_MAX_RETRIES})`,
        '',
        `Provider: ${provider.name} (${provider.model})`,
        `Turns: ${agentResult.turns}, Tool calls: ${agentResult.toolCalls}`,
        `Files changed: ${changedFiles.length}`,
        '',
        ...validation.results.filter((r) => !r.pass).map((r) => `❌ ${r.check}: ${r.detail.split('\n')[0]}`),
        '',
        `Changes reverted. Moved to ${targetLabel}.`,
        linearIssueUrl(issue.identifier),
      ].join('\n'),
      severity: 'warn',
    });

    await updateIssue(issue.id, { stateId: targetState });
    await addComment(
      issue.id,
      [
        `❌ **Validation failed** (Attempt ${attempt}/${RUNNER_MAX_RETRIES})`,
        '',
        `**Provider:** ${provider.name} (${provider.model})`,
        `**Turns:** ${agentResult.turns}`,
        `**Tool calls:** ${agentResult.toolCalls}`,
        `**Files changed:** ${changedFiles.length}`,
        `**Agent summary:** ${agentResult.summary}`,
        '',
        failureDetail,
        '',
        `Changes reverted. Moved to ${targetLabel}.`,
      ].join('\n'),
    );

    console.log(`[runner] ${issue.identifier} → ${targetLabel}`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const doOnce = args.includes('--once');
  const doStatus = args.includes('--status');

  if (doStatus) {
    showStatus();
    process.exit(0);
  }

  if (!doOnce) {
    console.error('Usage: symphony-runner.mjs --once [--dry-run] | --status');
    process.exit(2);
  }

  console.log(`[runner]${dryRun ? ' (DRY RUN)' : ''} starting at ${new Date().toISOString()}`);

  // Pre-flight checks
  if (!process.env.LINEAR_API_KEY) {
    console.error('[runner] LINEAR_API_KEY is not set');
    process.exit(1);
  }

  if (!existsSync(WORKFLOW_PATH)) {
    console.warn('[runner] WARNING: WORKFLOW.md not found — agent will use default prompt');
  }

  // Acquire PID lock
  if (!acquireLock()) {
    console.log('[runner] Another runner instance is active — exiting');
    process.exit(0);
  }

  // Register cleanup
  process.on('exit', releaseLock);
  process.on('SIGINT', () => { releaseLock(); process.exit(130); });
  process.on('SIGTERM', () => { releaseLock(); process.exit(143); });

  try {
    // Check git is clean
    if (!gitIsClean()) {
      console.log('[runner] Git working tree is dirty — skipping this cycle');
      console.log('[runner] Run "git stash" or commit changes first');
      process.exit(0);
    }

    // Recover any issues stuck in In Progress from a killed runner
    await recoverStuckIssues();

    // Pick issue
    const issue = await pickIssue();
    if (!issue) {
      console.log('[runner] No automatable Todo issues — nothing to do');
      process.exit(0);
    }

    console.log(`[runner] Picked: ${issue.identifier} (P${issue.priority}) — ${issue.title}`);

    // Execute
    await executeIssue(issue, dryRun);

    // Self-feed: immediately replenish the queue so the next timer
    // fire picks up work without waiting for the 15-min feeder.
    if (!dryRun) {
      try {
        console.log('[runner] Checking queue for replenishment...');
        const snap = await getQueueSnapshot();
        if (snap.queueDepth < TARGET_MIN) {
          await feedQueue(snap, false);
          console.log('[runner] Queue replenished — next cycle will have work');
        } else {
          console.log(`[runner] Queue depth ${snap.queueDepth} >= target_min ${TARGET_MIN} — no feed needed`);
        }
      } catch (err) {
        console.warn(`[runner] Queue feed after completion failed (non-fatal): ${err.message}`);
      }
    }

    console.log(`[runner] Completed at ${new Date().toISOString()}`);
    process.exit(0);
  } catch (err) {
    console.error(`[runner] Fatal error: ${err.message}`);
    console.error(err.stack);

    // Try to revert if we have uncommitted changes
    if (!gitIsClean()) {
      console.log('[runner] Reverting uncommitted changes...');
      gitRevert();
    }

    process.exit(1);
  }
}

main();
