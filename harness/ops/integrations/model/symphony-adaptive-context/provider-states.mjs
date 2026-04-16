/**
 * Adaptive context state is intentionally in-process (ephemeral).
 *
 * Each executor process maintains its own provider state Map that resets
 * on restart. This is correct because:
 * - Rate-limit windows and throttle timers are inherently time-bound
 * - Context-size adjustments should re-learn per-session, not carry stale caps
 * - Token/request event windows are short (60s) and meaningless across restarts
 * - Persisting this would add I/O on every request for no safety benefit
 *
 * Durable state (finalization, evidence, worktree ownership) is handled by
 * symphony-state.mjs and task-evidence.mjs — those ARE file-backed.
 */
export const providerStates = new Map();
