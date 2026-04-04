import { runToolLoop } from "./run-tool-loop.mjs";

export async function continueAgent({
  provider,
  messages,
  projectRoot,
  worktreeId,
  worktreeRoot,
  leaseId,
  executionMode,
  feedback,
  maxTurns,
  maxMs,
  taskDescription,
}) {
  messages.push({ role: "user", content: feedback });
  return runToolLoop({
    provider,
    messages,
    projectRoot,
    worktreeId,
    worktreeRoot,
    leaseId,
    executionMode,
    maxTurns,
    maxMs,
    startTime: Date.now(),
    taskDescription: taskDescription || "Symphony agent continuation",
  });
}
