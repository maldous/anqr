import { extractCorrelationId } from "../../../lib/correlation-id.mjs";

import { MAX_QUEUE_LENGTH } from "./max-queue-length.mjs";
import { dispatchLinearExecution } from "./dispatch-linear-execution.mjs";
import { json } from "./json.mjs";
import { linearQueue } from "./linear-queue.mjs";
import { selectLinearWorktree } from "./select-linear-worktree.mjs";
import { verifySchedulerClaim } from "./verify-scheduler-claim.mjs";
import { WORKTREES } from "./worktrees.mjs";
import { logInfo, logWarn, logError } from "./logger.mjs";

export function handleLinearTrigger(req, res) {
  // Read the request body to get identifier before selecting target.
  // ADR-0002: In authoritative mode, target selection depends on the
  // scheduler's durable assignment, which requires the issue identifier.
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

    const correlationId = extractCorrelationId(req.headers) || parsedBody.correlationId || null;
    if (correlationId) {
      logInfo(`Linear trigger for ${identifier} [${correlationId}]`);
    }

    // ADR-0002: Verify scheduler has claimed this issue before dispatch.
    // Router is transport, not claim authority.
    const claimCheck = verifySchedulerClaim(identifier);
    if (!claimCheck.allowed) {
      logWarn(`[router] Rejected dispatch for ${identifier}: ${claimCheck.reason}`);
      json(res, 409, {
        error: {
          message: `Dispatch rejected: scheduler has not claimed ${identifier}`,
          reason: claimCheck.reason,
        },
      });
      return;
    }

    // Select target worktree.
    // ADR-0002: The scheduler's durable assignment is the authoritative worktree
    // selection. The router honours it. If the assigned worktree is not found
    // (removed, reprovisioned), fall back to selection — but log the discrepancy.
    let target;
    let isSchedulerAssigned = false;
    if (claimCheck.assignedWorktreeId) {
      const assignedId = parseInt(claimCheck.assignedWorktreeId.replace(/^wt/, ""), 10);
      target = !isNaN(assignedId) ? WORKTREES.find((w) => w.id === assignedId) || null : null;
      if (target) {
        isSchedulerAssigned = true;
      } else {
        logWarn(
          `[router] Assigned worktree ${claimCheck.assignedWorktreeId} not found — falling back to selection`,
        );
        target = selectLinearWorktree();
      }
    } else {
      target = selectLinearWorktree();
    }

    if (!target) {
      logError("No Linear worktrees available for trigger");
      json(res, 503, { error: { message: "No worktrees available" } });
      return;
    }

    // Phase 4: When the scheduler assigned this worktree, trust the assignment.
    // The scheduler set the worktree to "executing" durably at claim time and
    // verified availability. Only check transient busy for fallback selection.
    if (!isSchedulerAssigned && target.activeRequests >= 1) {
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
      linearQueue.enqueue({ identifier, correlationId, queuedAt: new Date().toISOString() });
      json(res, 202, { status: "queued", queueLength: linearQueue.length });
      return;
    }

    // Dispatch to the selected worktree executor HTTP surface.
    // Pass the resolved target so dispatch doesn't re-select.
    json(res, 202, { status: "accepted" });
    dispatchLinearExecution(identifier, correlationId, target);
  });

  req.on("error", (err) => {
    logError(`Linear trigger request error: ${err.message}`);
  });
}
