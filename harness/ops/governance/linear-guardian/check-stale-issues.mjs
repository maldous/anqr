// Generated from ../../../scripts/ops/governance/linear-guardian.mjs:232

import { addComment, listIssuesByState } from "../../linear-client.mjs";

import { isStale } from "./is-stale.mjs";
import { logAction } from "./log-action.mjs";

export async function checkStaleIssues(dryRun) {
  const inProgress = await listIssuesByState(["In Progress"]);
  const stale = inProgress.filter(isStale);

  for (const issue of stale) {
    const age = Math.floor((Date.now() - new Date(issue.updatedAt).getTime()) / 60_000);
    if (dryRun) {
      logAction(
        "stale",
        `[DRY RUN] Would escalate ${issue.identifier}: stale ${age}min (${issue.title})`,
      );
    } else {
      await addComment(
        issue.id,
        `⏰ **Stale execution detected** — no update for ${age} minutes. Escalating.`,
      );
      logAction("stale", `Escalated ${issue.identifier}: stale ${age}min (${issue.title})`);
    }
  }

  return stale.length;
}
