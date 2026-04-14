import { loadState } from "./load-state.mjs";
import { normalizeRecord } from "./normalize-record.mjs";

/**
 * Integration-ready finalization states.
 * Issues whose finalization.state is in this set are candidates for
 * cherry-pick to main and/or evidence publication.
 */
const INTEGRATION_READY_STATES = new Set(["integration_pending", "evidence_pending_closeout"]);

/**
 * Derive integration candidates from issue finalization states.
 *
 * Phase 5: the persistent `integrationQueue` array is no longer the
 * authority — `finalization.state` on each issue record is.  This
 * function scans all issues and returns identifiers whose finalization
 * state indicates they are ready for integration or evidence closeout.
 *
 * @returns {string[]} Issue identifiers ready for integration.
 */
export function listIntegrationCandidates() {
  const store = loadState();
  const candidates = [];
  for (const [identifier, raw] of Object.entries(store.issues)) {
    const record = normalizeRecord(raw);
    const fin = record.finalization;
    if (fin && INTEGRATION_READY_STATES.has(fin.state)) {
      candidates.push(identifier);
    }
  }
  return candidates;
}
