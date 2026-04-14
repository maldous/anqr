/**
 * Worktree state transition helper — Workstream B Phase 2.
 *
 * This is the intended sole write API for worktree lifecycle state changes.
 * It validates the transition against the Phase 1 worktree transition map,
 * applies caller-supplied metadata, and normalizes the result via
 * normalizeWorktreeRecord — all within a single locked transaction.
 *
 * @module transition-worktree
 */

import { VALID_WORKTREE_STATES, normalizeWorktreeRecord } from "./worktree-record-schema.mjs";
import { isValidWorktreeTransition } from "./is-valid-worktree-transition.mjs";
import { loadState } from "./load-state.mjs";
import { saveState } from "./save-state.mjs";
import { withStateLock } from "./with-state-lock.mjs";

/**
 * Atomically transition a worktree to a new lifecycle state.
 *
 * @param {string} worktreeId
 * @param {string} targetState - One of WORKTREE_STATES values
 * @param {object} [metadata]  - Fields to merge into the worktree record
 * @returns {{ ok: boolean, from?: string, to: string, record?: object, reason?: string }}
 */
export function transitionWorktree(worktreeId, targetState, metadata = {}) {
  if (!VALID_WORKTREE_STATES.has(targetState)) {
    return { ok: false, reason: "invalid_target_state", from: null, to: targetState };
  }

  return withStateLock(() => {
    const store = loadState();
    const existing = store.worktreeStates[worktreeId] || {};
    const from = existing.state || "available";

    if (!isValidWorktreeTransition(from, targetState)) {
      return { ok: false, reason: "invalid_transition", from, to: targetState };
    }

    const merged = {
      ...existing,
      ...metadata,
      state: targetState,
      updatedAt: new Date().toISOString(),
    };
    const record = normalizeWorktreeRecord(worktreeId, merged);
    store.worktreeStates[worktreeId] = record;
    saveState(store);
    return { ok: true, from, to: targetState, record };
  });
}
