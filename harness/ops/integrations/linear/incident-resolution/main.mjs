// Generated from ../../../../scripts/ops/integrations/linear/incident-resolution.mjs:162

import { listIssuesByState } from "../linear-client.mjs";

import { autoResolveIncident } from "./auto-resolve-incident.mjs";
import { canAutoResolve } from "./can-auto-resolve.mjs";
import { logInfo, logWarn } from "./logger.mjs";

export async function main() {
  logInfo("[incident-resolver] Starting incident resolution check...");

  // Find open incidents (Todo, In Progress, In Review)
  const openStates = ["Todo", "In Progress", "In Review"];
  const issues = await listIssuesByState(openStates);

  // Filter to only incidents with the incident label
  const incidents = issues.filter((issue) =>
    issue.labels?.nodes?.some((label) => label.name === "incident"),
  );

  logInfo(`[incident-resolver] Found ${incidents.length} open incidents`);

  let resolved = 0;
  let skipped = 0;

  for (const issue of incidents) {
    try {
      const resolution = await canAutoResolve(issue);

      if (resolution.canResolve) {
        await autoResolveIncident(issue, resolution);
        resolved++;
      } else {
        skipped++;
      }

      // Rate limit: small delay between checks
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err) {
      logWarn(`[incident-resolver] Failed to check ${issue.identifier}: ${err.message}`);
    }
  }

  logInfo(`[incident-resolver] Complete: ${resolved} resolved, ${skipped} skipped`);
}
