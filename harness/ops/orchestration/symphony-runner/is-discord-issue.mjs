// Generated from ../../../scripts/ops/orchestration/symphony-runner.mjs:595

import { getIssueState } from "../../symphony-state.mjs";
import { logDebug } from "./logger.mjs";

export function isDiscordIssue(issue) {
  const state = getIssueState(issue.identifier);
  const source = state.source || "";
  const isFromDiscord = source.toLowerCase().includes("discord");
  logDebug(
    `[worktree-routing] isDiscordIssue(${issue.identifier}) - source: '${source}', result: ${isFromDiscord}`,
  );
  return isFromDiscord;
}
