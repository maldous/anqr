import { extractCorrelationId } from "../../../lib/correlation-id.mjs";

import { dispatchLinearExecution } from "./dispatch-linear-execution.mjs";
import { json } from "./json.mjs";
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

    // ADR-0002: Strict scheduler authority — the scheduler's durable assignment
    // is the sole worktree selection path. No fallback to local selection.
    let target;
    if (claimCheck.assignedWorktreeId) {
      const assignedId = Number.parseInt(claimCheck.assignedWorktreeId.replace(/^wt/, ""), 10);
      target = !isNaN(assignedId) ? WORKTREES.find((w) => w.id === assignedId) || null : null;
      if (!target) {
        logWarn(
          `[router] Assigned worktree ${claimCheck.assignedWorktreeId} not found in pool — rejecting dispatch`,
        );
        json(res, 503, {
          error: {
            message: `Assigned worktree ${claimCheck.assignedWorktreeId} not found`,
            reason: "assigned_worktree_missing",
          },
        });
        return;
      }
    } else {
      // verifySchedulerClaim already requires assignment.worktreeId — this branch
      // is unreachable but guarded for defense-in-depth.
      logWarn(`[router] No worktree assignment in scheduler claim for ${identifier} — rejecting`);
      json(res, 409, {
        error: {
          message: `No worktree assignment for ${identifier}`,
          reason: "no_worktree_assignment",
        },
      });
      return;
    }

    // Dispatch to the assigned worktree executor HTTP surface.
    json(res, 202, { status: "accepted" });
    dispatchLinearExecution(identifier, correlationId, target);
  });

  req.on("error", (err) => {
    logError(`Linear trigger request error: ${err.message}`);
  });
}
