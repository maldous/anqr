/**
 * symphony-config.mjs — Centralized Symphony execution configuration
 *
 * Single source of truth for all queue, concurrency, and timeout parameters.
 * Imported by linear-guardian.mjs, symphony-queue-control.mjs, and
 * any future Symphony orchestration scripts.
 *
 * Legacy lessons encoded here:
 *   - Ollama has one practical execution slot
 *   - Initially fed 5–10 issues, reduced to 2–3 after GPU contention
 *   - Queue health must be actively drained, not allowed to accumulate
 *   - Stuck work must be detected and moved back, not left in limbo
 */

import { LABELS } from "../linear-client.mjs";

export const TARGET_MIN = 8;
export const TARGET_MAX = 16;
export const MAX_CONCURRENT_AGENTS = 8; // 4 Symphony (wt1-wt4) + 4 Discord (wt5-wt8)

// ---------------------------------------------------------------------------
// Timing policy (all constants must be strictly ordered — see chain below)
//
//   HEARTBEAT_INTERVAL_MS  <  RECOVERY_GRACE_MS  <  LEASE_TTL (env)  <  TASK_TIMEOUT_MS  <  STALE_THRESHOLD_MS  <  RUNNER_MAX_EXECUTION_MS
//   5 min                     10 min                20 min               25 min              30 min                 120 min
//
// - HEARTBEAT_INTERVAL_MS: background heartbeat renews the lease every interval.
// - RECOVERY_GRACE_MS: queue-control waits this long after lease expiry before
//   recovering, to tolerate heartbeat jitter and brief network delays.
// - LEASE_TTL (env, default 20min): if heartbeat stops, lease expires after this.
// - TASK_TIMEOUT_MS: queue-control considers recovering after this if no lease.
//   Must be > LEASE_TTL to avoid recovering while the lease is still valid.
// - STALE_THRESHOLD_MS: hard stale threshold for queue-control classification.
// - RUNNER_MAX_EXECUTION_MS: hard wall-time limit for the entire runner cycle.
//
// On heartbeat failure (lease_mismatch), the runner ABORTS the run safely
// rather than continuing silently with a lost lease.
// ---------------------------------------------------------------------------
export const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000; // 5 min — background heartbeat during active runs
export const RECOVERY_GRACE_MS = 10 * 60 * 1000; // 10 min — grace period after lease expiry before recovery
export const STALE_THRESHOLD_MS = 30 * 60 * 1000; // 30 min — after this in In Progress, consider stuck
export const TASK_TIMEOUT_MS = 25 * 60 * 1000; // 25 min — must be > LEASE_TTL (20 min default)

export const TITLE_PREFIX = "Harness";
export const REQUIRED_LABEL_IDS = [LABELS.harness];

export const QUEUE_STATES = {
  feedSource: ["Backlog"],
  activeStates: ["In Progress"],
  readyStates: ["Todo"],
};

// ---------------------------------------------------------------------------
// Runner configuration (Symphony execution agent)
// ---------------------------------------------------------------------------

export const RUNNER_MAX_TURNS = 600;
export const RUNNER_MAX_EXECUTION_MS = 7_200_000; // 120 min hard timeout — local Ollama averages ~1.5 min/turn
export const RUNNER_MAX_RETRIES = 2;
export const RUNNER_OLLAMA_MODEL = "qwen2.5-coder:3b-instruct";
export const RUNNER_OLLAMA_MODELS = ["qwen2.5-coder:3b-instruct", "qwen2.5-coder:0.5b"];
export const RUNNER_OLLAMA_BASE_URL = "http://localhost:11434/v1";
export const RUNNER_MAX_OUTPUT_TOKENS = 4096;
export const RUNNER_PROVIDER_FAILURE_WINDOW_SECS = 360;
export const RUNNER_PAID_PROVIDER_FAILURE_WINDOW_SECS = 120; // 2 min — paid providers have temporary rate limits, retry sooner
export const RUNNER_AUTO_PUSH = false; // Disabled until harness stability is restored (see goal.txt acceptance criteria)
export const RUNNER_STUCK_THRESHOLD_MS = 15 * 60 * 1000; // 15 min — if In Progress with no update, assume runner was killed
export const RUNNER_TURN_BUDGET_WARNING = 5; // inject wrap-up warning when this many turns remain
export const RUNNER_MAX_VALIDATION_FIXES = 3; // times the agent can attempt to fix validation errors before revert
export const RUNNER_VALIDATION_FIX_TURNS = 20; // turn budget per validation-fix attempt
export const RUNNER_ISSUE_COOLDOWN_MS = 10 * 60 * 1000; // 10 min — skip recently-failed issues to prevent tight retry loops
