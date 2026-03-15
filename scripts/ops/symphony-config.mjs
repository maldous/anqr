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

import { LABELS } from './linear-client.mjs';

export const TARGET_MIN = 1;
export const TARGET_MAX = 2;
export const MAX_CONCURRENT_AGENTS = 1;

export const STALE_THRESHOLD_MS = 30 * 60 * 1000;
export const TASK_TIMEOUT_MS = 5 * 60 * 1000;

export const TITLE_PREFIX = 'Harness';
export const REQUIRED_LABEL_IDS = [LABELS.reliability];

export const QUEUE_STATES = {
  feedSource: ['Backlog'],
  activeStates: ['In Progress'],
  readyStates: ['Todo'],
};

// ---------------------------------------------------------------------------
// Runner configuration (Symphony execution agent)
// ---------------------------------------------------------------------------

export const RUNNER_MAX_TURNS = 25;
export const RUNNER_MAX_EXECUTION_MS = 600_000; // 10 min hard timeout
export const RUNNER_MAX_RETRIES = 2;
export const RUNNER_COMMIT_PREFIX = 'fix(symphony)';
export const RUNNER_OLLAMA_MODEL = 'qwen3.5:35b-a3b-32t';
export const RUNNER_OLLAMA_BASE_URL = 'http://localhost:11434/v1';
export const RUNNER_MAX_OUTPUT_TOKENS = 4096;
export const RUNNER_PROVIDER_FAILURE_WINDOW_SECS = 360;
export const RUNNER_AUTO_PUSH = false;
