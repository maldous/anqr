import { claimAndAssignWorktree, releaseLease } from "../../symphony-state.mjs";
import {
  SCHEDULER_MAX_DISPATCH_PER_CYCLE,
  RECONCILER_DISPATCH_COOLDOWN_MS,
  TARGET_MIN,
} from "../../symphony-config.mjs";
import { getQueueSnapshot, feedQueue, detectStuckWork } from "../../symphony-queue-control.mjs";
import { getHealthyLinearCapacity } from "../linear-reconciler/get-healthy-linear-capacity.mjs";
import { getEligibleWork } from "./get-eligible-work.mjs";
import { dispatchToExecutor } from "./dispatch-to-executor.mjs";
import { planIssue, issueAlreadyPlanned, markPlanned } from "../symphony-planner/plan-issue.mjs";
import { logInfo, logWarn, logDebug } from "./logger.mjs";

/**
 * Run one authoritative scheduling cycle — ADR-0002.
 *
 * 1. Detect stuck work and feed queue if needed
 * 2. Compute healthy capacity
 * 3. Get eligible work (priority-sorted)
 * 4. Atomically claim + dispatch up to budget
 */
export async function scheduleCycle() {
  const cycleStart = Date.now();

  // Housekeeping: detect stuck work, feed queue
  const snap = await getQueueSnapshot();
  await detectStuckWork(snap, false);
  if (snap.readyDepth < TARGET_MIN) {
    logDebug(`[scheduler] Queue depth ${snap.readyDepth} < target ${TARGET_MIN} — feeding`);
    await feedQueue(snap, false);
  }

  // Compute capacity
  const capacity = getHealthyLinearCapacity();
  if (capacity.healthy === 0) {
    logWarn("[scheduler] No healthy Linear worktrees — skipping cycle");
    return { dispatched: 0, skipped: true, reason: "no_healthy_worktrees" };
  }

  const freshSnap = await getQueueSnapshot();
  const dispatchBudget = Math.min(
    Math.max(0, capacity.available),
    SCHEDULER_MAX_DISPATCH_PER_CYCLE,
  );

  if (dispatchBudget === 0) {
    logDebug(
      `[scheduler] No dispatch budget (available=${capacity.available}, active=${freshSnap.activeDepth})`,
    );
    return { dispatched: 0, budget: 0 };
  }

  // Get eligible work
  const eligible = await getEligibleWork();
  if (eligible.length === 0) {
    logDebug("[scheduler] No eligible issues");
    return { dispatched: 0, eligible: 0 };
  }

  // Enrich unplanned issues with AI planning context before dispatch.
  // Await so the plan comment lands in Linear before executor fetches the issue.
  // Soft failure — planning errors never block dispatch.
  for (const issue of eligible.slice(0, dispatchBudget)) {
    if (!issueAlreadyPlanned(issue)) {
      try {
        await planIssue(issue);
        markPlanned(issue.identifier);
        logInfo(`[scheduler] Planned ${issue.identifier}`);
      } catch (err) {
        logWarn(`[scheduler] Planning failed for ${issue.identifier}: ${err.message}`);
      }
    }
  }

  // ADR-0002: Build available worktree pool from durable capacity state.
  // The scheduler assigns a worktree at claim time so the durable claim
  // includes the assignment. The router then honours the assignment.
  const availableWorktrees = capacity.worktrees
    .filter((w) => w.healthy && !w.executing)
    .map((w) => w.wtId);
  const assignedThisCycle = new Set();

  // Claim and dispatch
  let dispatched = 0;
  let claimRejected = 0;

  for (const issue of eligible.slice(0, dispatchBudget)) {
    // Pick an available worktree not yet assigned in this cycle.
    // ADR-0002: The scheduler must assign a worktreeId at claim time.
    // If no worktree is available, skip — do not claim without assignment.
    const worktreeId = availableWorktrees.find((wt) => !assignedThisCycle.has(wt)) || null;
    if (!worktreeId) {
      logDebug(`[scheduler] No available worktrees remaining this cycle — stopping dispatch`);
      break;
    }

    // Blocker 3: Atomic claim + worktree assignment in one locked transaction.
    const claim = claimAndAssignWorktree(issue.identifier, {
      worktreeId,
      source: "scheduler",
    });

    if (!claim.ok) {
      logDebug(`[scheduler] Claim rejected for ${issue.identifier}: ${claim.reason}`);
      claimRejected++;
      continue;
    }

    assignedThisCycle.add(worktreeId);

    const ok = await dispatchToExecutor(issue.identifier, null);
    if (ok) {
      dispatched++;
      logInfo(
        `[scheduler] Claimed + dispatched ${issue.identifier} -> ${worktreeId}: ${issue.title}`,
      );
    } else {
      // Blocker 5: Roll back on dispatch failure — release claim and
      // clear worktree ownership so the system does not leak a claimed
      // but never-executing issue+worktree pair.
      logWarn(
        `[scheduler] Dispatch failed for ${issue.identifier} — rolling back claim + worktree`,
      );
      releaseLease(issue.identifier);
      assignedThisCycle.delete(worktreeId);
    }

    if (RECONCILER_DISPATCH_COOLDOWN_MS > 0 && dispatched < dispatchBudget) {
      await new Promise((r) => setTimeout(r, RECONCILER_DISPATCH_COOLDOWN_MS));
    }
  }

  const cycleMs = Date.now() - cycleStart;
  logInfo(
    `[scheduler] Cycle complete: dispatched=${dispatched} rejected=${claimRejected} eligible=${eligible.length} budget=${dispatchBudget} (${cycleMs}ms)`,
  );

  return { dispatched, claimRejected, eligible: eligible.length, budget: dispatchBudget, cycleMs };
}
