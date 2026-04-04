import { getAllProviderHealthStates } from "../../model/symphony-provider-health.mjs";

import { getGitContext } from "./get-git-context.mjs";
import { getServiceJournal } from "./get-service-journal.mjs";
import { getStateFileInfo } from "./get-state-file-info.mjs";
import { getSystemInfo } from "./get-system-info.mjs";

export async function collectIncidentEvidence(serviceName = null, errorContext = {}) {
  const evidence = {
    timestamp: new Date().toISOString(),
    errorContext,
    gitContext: getGitContext(),
    systemInfo: getSystemInfo(),
    providerHealth: getAllProviderHealthStates(),
    stateFile: getStateFileInfo(),
  };

  if (serviceName) {
    evidence.serviceName = serviceName;
    evidence.journalLog = getServiceJournal(serviceName, 100);
  }

  return evidence;
}
