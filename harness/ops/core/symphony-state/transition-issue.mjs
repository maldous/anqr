/**
 * Issue phase transition helper — Workstream B Phase 2.
 *
 * This is the intended sole write API for issue lifecycle state changes.
 * It validates the transition against the Phase 1 transition map,
 * applies caller-supplied metadata as a patch, and records the
 * transition in the issue's history — all within a single locked
 * transaction.
 *
 * Design rule: callers provide the target phase and any field changes
 * needed for that transition. transitionIssue validates the lifecycle
 * change; the caller provides the data change. The `reason` field in
 * metadata is captured in the transition history entry but is not
 * persisted as a record field.
 *
 * @module transition-issue
 */

import { VALID_ISSUE_PHASES } from "./issue-phases.mjs";
import { inferExecutionPhase } from "./infer-execution-phase.mjs";
import { isValidIssueTransition } from "./is-valid-issue-transition.mjs";
import { normalizeRecord } from "./normalize-record.mjs";
import { pruneHistory } from "./prune-history.mjs";
import { HOST_ID } from "./host-id.mjs";
import { nowIso } from "./now-iso.mjs";
import { loadState } from "./load-state.mjs";
import { saveState } from "./save-state.mjs";
import { withStateLock } from "./with-state-lock.mjs";

/**
 * Atomically transition an issue to a new lifecycle phase.
 *
 * @param {string} issueIdentifier
 * @param {string} targetPhase - One of ISSUE_PHASES values
 * @param {object} [metadata]  - Fields to patch on the record. The `reason`
 *   key is extracted for the transition history entry and is not persisted
 *   as a record field.
 * @returns {{ ok: boolean, from?: string, to: string, record?: object, reason?: string }}
 */
export function transitionIssue(issueIdentifier, targetPhase, metadata = {}) {
  if (!VALID_ISSUE_PHASES.has(targetPhase)) {
    return { ok: false, reason: "invalid_target_phase", from: null, to: targetPhase };
  }

  return withStateLock(() => {
    const store = loadState();
    const current = normalizeRecord(store.issues[issueIdentifier] || { issueIdentifier });
    const from = inferExecutionPhase(current);

    if (!isValidIssueTransition(from, targetPhase)) {
      return { ok: false, reason: "invalid_transition", from, to: targetPhase };
    }

    // Extract `reason` for transition history; everything else is a state patch
    const { reason, ...patch } = metadata;

    // Deep-merge finalization to match setFinalizationState's merge semantics.
    // Callers can pass partial finalization objects and they get merged with existing.
    if (patch.finalization && current.finalization) {
      patch.finalization = { ...current.finalization, ...patch.finalization };
    }

    const next = normalizeRecord({ ...current, ...patch, issueIdentifier });

    // Record transition in history inline (avoids double load/save that
    // would happen if we called recordTransition separately)
    next.transitions = pruneHistory([
      ...next.transitions,
      { at: nowIso(), host: HOST_ID, from, to: targetPhase, reason: reason || null },
    ]);

    store.issues[issueIdentifier] = next;
    saveState(store);
    return { ok: true, from, to: targetPhase, record: next };
  });
}
