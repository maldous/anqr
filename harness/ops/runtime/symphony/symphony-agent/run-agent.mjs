import { RUNNER_MAX_TURNS, RUNNER_MAX_EXECUTION_MS } from "../../../symphony-config.mjs";

import { buildIssuePrompt } from "./build-issue-prompt.mjs";
import { runToolLoop } from "./run-tool-loop.mjs";

export async function runAgent({
  provider,
  issue,
  projectRoot,
  worktreeId,
  worktreeRoot,
  leaseId,
  executionMode,
  systemPrompt,
  maxMs,
}) {
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: buildIssuePrompt(issue) },
  ];
  const taskDescription = issue ? `${issue.identifier}: ${issue.title}` : "Symphony agent run";
  return runToolLoop({
    provider,
    messages,
    projectRoot,
    worktreeId,
    worktreeRoot,
    leaseId,
    executionMode,
    maxTurns: RUNNER_MAX_TURNS,
    maxMs: maxMs || RUNNER_MAX_EXECUTION_MS,
    startTime: Date.now(),
    taskDescription,
  });
}
