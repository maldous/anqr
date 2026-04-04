// Generated from ../../../scripts/ops/governance/linear-guardian.mjs:169

import {
  createIssue,
  updateIssue,
  findOpenIssuesByTitle,
  addComment,
  STATES,
} from "../../linear-client.mjs";
import { TARGET_MAX, REQUIRED_LABEL_IDS } from "../../symphony-config.mjs";
import { patchIssueState } from "../../core/symphony-state.mjs";

import { CHECK_METADATA } from "./check-metadata.mjs";
import { buildCommentBody } from "./build-comment-body.mjs";
import { buildIssueBody } from "./build-issue-body.mjs";
import { buildIssueTitle } from "./build-issue-title.mjs";
import { issueNeedsLabelHygiene } from "./issue-needs-label-hygiene.mjs";
import { logAction } from "./log-action.mjs";
import { mergedLabelIds } from "./merged-label-ids.mjs";

export async function processFailingCheck(check, report, queueDepth, dryRun) {
  const title = buildIssueTitle(check.name);
  const meta = CHECK_METADATA[check.name] || { summary: check.name, priority: 3, extraLabels: [] };

  const existing = await findOpenIssuesByTitle(title);
  const exact = existing.filter((i) => i.title === title);

  if (exact.length > 0) {
    const issue = exact[0];
    const body = buildCommentBody(check, report);

    if (dryRun) {
      logAction("comment", `[DRY RUN] Would comment on ${issue.identifier}: ${title}`);
    } else {
      await addComment(issue.id, body);
      logAction("comment", `Commented on ${issue.identifier}: ${title}`);
    }

    if (issueNeedsLabelHygiene(issue)) {
      const labels = mergedLabelIds(issue);
      if (dryRun) {
        logAction("hygiene", `[DRY RUN] Would enforce labels on ${issue.identifier}`);
      } else {
        await updateIssue(issue.id, { labelIds: labels });
        logAction("hygiene", `Enforced labels on ${issue.identifier}`);
      }
    }

    return;
  }

  if (queueDepth >= TARGET_MAX) {
    logAction("skip", `Queue full (${queueDepth}/${TARGET_MAX}), skipping: ${title}`);
    return;
  }

  const labelIds = [...REQUIRED_LABEL_IDS, ...meta.extraLabels];
  const input = {
    title,
    description: buildIssueBody(check, report),
    stateId: STATES.backlog,
    priority: meta.priority,
    labelIds,
  };

  if (dryRun) {
    logAction(
      "create",
      `[DRY RUN] Would create: ${title} (P${meta.priority}, ${labelIds.length} labels)`,
    );
  } else {
    const issue = await createIssue(input);
    logAction("create", `Created ${issue.identifier}: ${title}`);

    // Mark issue source for worktree routing
    // Linear-created issues should route to Symphony worktrees (wt1-wt4, main)
    patchIssueState(issue.identifier, { source: "linear" });
  }

  queueDepth++;
  return queueDepth;
}
