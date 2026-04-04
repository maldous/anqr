import {
  listIntegrationCandidates,
  acquireIntegrationLock,
  releaseIntegrationLock,
} from "../../symphony-state.mjs";

import { INTEGRATOR_ID } from "./integrator-id.mjs";
import { LOCK_TTL_MS } from "./lock-ttl-ms.mjs";
import { integrateCandidate } from "./integrate-candidate.mjs";
import { scanForRepairedCandidates } from "./scan-for-repaired-candidates.mjs";
import { logInfo, logWarn, logDebug } from "./logger.mjs";

export async function processQueue() {
  // Phase 4: Scan for repaired candidates before processing queue
  scanForRepairedCandidates();

  const candidates = listIntegrationCandidates();
  if (candidates.length === 0) {
    logDebug(`[integrator] Queue empty`);
    return { processed: 0 };
  }

  logInfo(`[integrator] Queue has ${candidates.length} candidate(s): ${candidates.join(", ")}`);

  // Acquire global integration lock
  const lock = acquireIntegrationLock(INTEGRATOR_ID, LOCK_TTL_MS);
  if (!lock.ok) {
    logWarn(
      `[integrator] Lock held by ${lock.holder} (expires ${lock.expiresAt}) — skipping cycle`,
    );
    return { processed: 0, reason: "locked" };
  }

  let processed = 0;
  try {
    for (const issueIdentifier of candidates) {
      const result = await integrateCandidate(issueIdentifier);
      processed++;
      if (result.ok) {
        logInfo(`[integrator] ✅ ${issueIdentifier}: integrated`);
      } else {
        logWarn(`[integrator] ❌ ${issueIdentifier}: ${result.reason}`);
      }
    }
  } finally {
    releaseIntegrationLock(INTEGRATOR_ID);
  }

  return { processed };
}
