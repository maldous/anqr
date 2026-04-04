#!/usr/bin/env node

/**
 * close-reviewed-issues.mjs — Close issues verified in backlog review
 *
 * From review.md:
 * - ANQ-1089: "Tool permission error: run_terminal_command not available" → FIXED/CLOSE
 * - ANQ-1093: "[Sonar] String.raw should be used" → DELETE (file deleted)
 */

import { updateIssue, addComment, STATES, listIssuesByState } from "./linear-client.mjs";
import { createLogger } from "../../lib/logger.mjs";

const { logInfo } = createLogger();

async function main() {
  // ANQ-1089 - Fixed
  const anq1089 = "ANQ-1089";
  logInfo(`[close-reviewed] Processing ${anq1089}...`);
  const issues1 = await listIssuesByState(["In Progress", "Todo", "Backlog", "In Review"]);
  const issue1089 = issues1.find((i) => i.identifier === anq1089);

  if (issue1089) {
    logInfo(`[close-reviewed] Found: ${issue1089.title} (state: ${issue1089.state?.name})`);
    await addComment(
      issue1089.id,
      `📋 **Backlog Review Finding** — Verified as FIXED.\n\nThe tool \`run_terminal_command\` is now properly defined in:\n- \`.agents/types/tools.types.ts\` (line 20)\n- \`.agents/types/agent-definition.types.ts\` (line 332)\n\nNo further action needed.`,
    );
    await updateIssue(issue1089.id, { stateId: STATES.done });
    logInfo(`[close-reviewed] ✅ Closed ${anq1089}`);
  } else {
    logInfo(`[close-reviewed] ${anq1089} not found or already closed`);
  }

  // ANQ-1093 - No longer applicable (file deleted)
  const anq1093 = "ANQ-1093";
  logInfo(`[close-reviewed] Processing ${anq1093}...`);
  const issues2 = await listIssuesByState(["In Progress", "Todo", "Backlog", "In Review"]);
  const issue1093 = issues2.find((i) => i.identifier === anq1093);

  if (issue1093) {
    logInfo(`[close-reviewed] Found: ${issue1093.title} (state: ${issue1093.state?.name})`);
    await addComment(
      issue1093.id,
      `📋 **Backlog Review Finding** — No longer applicable.\n\nThe referenced file \`scripts/ops/integrations/linear/reopen-stuck-issues.mjs\` was deleted in commit \`7238d4904\`.\n\nThe Sonar issue (S7780 - use String.raw) no longer applies as the code no longer exists.\n\nPlease cancel/close this issue.`,
    );
    await updateIssue(issue1093.id, { stateId: STATES.canceled });
    logInfo(`[close-reviewed] ✅ Canceled ${anq1093}`);
  } else {
    logInfo(`[close-reviewed] ${anq1093} not found or already closed`);
  }

  logInfo(`[close-reviewed] ✅ All reviewed issues processed`);
}

await main();
