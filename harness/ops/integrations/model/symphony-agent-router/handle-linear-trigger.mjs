import { MAX_QUEUE_LENGTH } from "./max-queue-length.mjs";
import { WORKTREES } from "./worktrees.mjs";
import { dispatchLinearExecution } from "./dispatch-linear-execution.mjs";
import { json } from "./json.mjs";
import { linearQueue } from "./linear-queue.mjs";
import { logInfo, logWarn, logError } from "./logger.mjs";

export function handleLinearTrigger(req, res) {
  // Only route to Linear worktrees (wt1-4)
  const linearWorktrees = WORKTREES.filter((w) => w.id >= 1 && w.id <= 4);
  if (linearWorktrees.length === 0) {
    logError("No Linear worktrees available for trigger");
    json(res, 503, { error: { message: "No worktrees available" } });
    return;
  }

  // Select least-loaded Linear worktree
  const target = linearWorktrees.sort((a, b) => a.activeRequests - b.activeRequests)[0];

  // Read the request body to get identifier
  const chunks = [];
  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", () => {
    let parsedBody = {};
    try {
      parsedBody = JSON.parse(Buffer.concat(chunks).toString());
    } catch (err) {
      logError(`Invalid JSON in trigger: ${err.message}`);
      json(res, 400, { error: { message: "Invalid JSON" } });
      return;
    }

    const identifier = parsedBody.identifier || req.headers["x-linear-identifier"];
    if (!identifier) {
      logError("Missing identifier in trigger");
      json(res, 400, { error: { message: "Missing identifier" } });
      return;
    }

    // If all worktrees are busy, queue the trigger
    if (target.activeRequests >= 1) {
      if (linearQueue.length >= MAX_QUEUE_LENGTH) {
        logWarn(
          `Linear trigger queue full (${MAX_QUEUE_LENGTH}), dropping trigger for ${identifier}`,
        );
        json(res, 503, { error: { message: "Queue full, try again later" } });
        return;
      }
      logInfo(
        `All Linear worktrees busy, queuing ${identifier} (queue length: ${linearQueue.length + 1})`,
      );
      linearQueue.push({ identifier, queuedAt: new Date().toISOString() });
      json(res, 202, { status: "queued", queueLength: linearQueue.length });
      return;
    }

    // Dispatch directly to the selected worktree executor HTTP surface
    json(res, 202, { status: "accepted" });
    dispatchLinearExecution(identifier);
  });

  req.on("error", (err) => {
    logError(`Linear trigger request error: ${err.message}`);
  });
}
