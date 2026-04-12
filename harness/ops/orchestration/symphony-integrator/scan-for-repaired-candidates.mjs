import {
  listIntegrationCandidates,
  enqueueIntegrationCandidate,
  loadState,
} from "../../symphony-state.mjs";
import { logInfo } from "./logger.mjs";

const REPAIRABLE_QUEUE_STATES = new Set(["integration_pending", "evidence_pending_closeout"]);

export function scanForRepairedCandidates() {
  const store = loadState();
  let reenqueued = 0;
  const queued = new Set(listIntegrationCandidates());
  for (const [identifier, record] of Object.entries(store.issues)) {
    const fin = record.finalization;
    if (fin && REPAIRABLE_QUEUE_STATES.has(fin.state) && !queued.has(identifier)) {
      logInfo(`[integrator] Re-enqueuing candidate: ${identifier} (${fin.state})`);
      enqueueIntegrationCandidate(identifier);
      reenqueued++;
    }
  }
  if (reenqueued > 0) {
    logInfo(`[integrator] Re-enqueued ${reenqueued} candidate(s)`);
  }
}
