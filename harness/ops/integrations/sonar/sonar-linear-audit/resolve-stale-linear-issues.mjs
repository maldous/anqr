// Generated from ../../../../scripts/ops/integrations/sonar/sonar-linear-audit.mjs:56

import { findOpenLinearIssuesByTag } from "../../../lib/sonar-linear-sync.mjs";
import { updateIssue, STATES } from "../../linear/linear-client.mjs";

export async function resolveStaleLinearIssues(sonarKeys, tag, keyType) {
  const existingIssues = await findOpenLinearIssuesByTag(tag);
  const resolved = [];

  for (const issue of existingIssues) {
    // Extract sonar key from issue description
    const keyMatch = issue.description?.match(new RegExp(`<!-- sonar-${keyType}key:([^>]+) -->`));
    const sonarKey = keyMatch ? keyMatch[1] : null;

    // If not found in current Sonar findings, resolve it
    if (!sonarKey || !sonarKeys.includes(sonarKey)) {
      await updateIssue(issue.id, { stateId: STATES.done });
      resolved.push(issue.identifier);
    }
  }

  return resolved;
}
