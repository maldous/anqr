import {
  listIntegrationCandidates,
  enqueueIntegrationCandidate,
  loadState,
} from "../../symphony-state.mjs";
import { logInfo } from "./logger.mjs";

export function scanForRepairedCandidates() {
  const store = loadState();
  let reenqueued = 0;
  for (const [identifier, record] of Object.entries(store.issues)) {
    const fin = record.finalization;
    if (
      fin &&
      fin.state === "integration_pending" &&
      !listIntegrationCandidates().includes(identifier)
    ) {
      logInfo(`[integrator] Re-enqueuing repaired candidate: ${identifier}`);
      enqueueIntegrationCandidate(identifier);
      reenqueued++;
    }
  }
  if (reenqueued > 0) {
    logInfo(`[integrator] Re-enqueued ${reenqueued} repaired candidate(s)`);
  }
}
