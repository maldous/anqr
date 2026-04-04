#!/usr/bin/env node

/**
 * close-anq-1097.mjs — Close ANQ-1097 issue that's stuck in loop
 *
 * ANQ-1097 is stuck in "In Progress" but the work is complete:
 * - File harness/ops/integrations/linear/reopen-stuck-issues.mjs was already deleted
 * - Evidence file confirms resolution
 * - Issue needs to be marked Done to stop the loop
 */

import { updateIssue, addComment, STATES, listIssuesByState } from "./linear-client.mjs";
import { createLogger } from "../../lib/logger.mjs";

const { logInfo } = createLogger();

async function main() {
  const issueIdentifier = "ANQ-1097";

  logInfo(`[close-anq-1097] Closing ${issueIdentifier}...`);

  // The issue ID needs to be fetched from Linear API
  // We'll search for it by identifier
  const allIssues = await listIssuesByState(["In Progress", "Todo", "Backlog"]);
  const issue = allIssues.find((i) => i.identifier === issueIdentifier);

  if (!issue) {
    logInfo(`[close-anq-1097] Issue ${issueIdentifier} not found or already closed`);
    return;
  }

  logInfo(`[close-anq-1097] Found issue: ${issue.title}`);
  logInfo(`[close-anq-1097] Current state: ${issue.state?.name || "Unknown"}`);

  // Add completion comment
  await addComment(
    issue.id,
    `✅ **Manually closed** — The referenced file \`harness/ops/integrations/linear/reopen-stuck-issues.mjs\` was already deleted in commit \`7238d4904\`.

Evidence file created at \`docs/harness/evidence/ANQ-1097-evidence.md\` confirms resolution.

No code changes needed. Issue was stuck in loop and has been manually resolved.`,
  );

  // Mark as Done
  await updateIssue(issue.id, { stateId: STATES.done });

  logInfo(`[close-anq-1097] ✅ Successfully closed ${issueIdentifier}`);
}

await main();
