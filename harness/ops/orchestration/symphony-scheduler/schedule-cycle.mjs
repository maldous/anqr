import http from "node:http";
import { claimIssue } from "../../symphony-state.mjs";
import {
  SCHEDULER_MAX_DISPATCH_PER_CYCLE,
  RECONCILER_DISPATCH_COOLDOWN_MS,
  TARGET_MIN,
} from "../../symphony-config.mjs";
import { getQueueSnapshot, feedQueue, detectStuckWork } from "../../symphony-queue-control.mjs";
import { getHealthyLinearCapacity } from "../linear-reconciler/get-healthy-linear-capacity.mjs";
import { getEligibleWork } from "./get-eligible-work.mjs";
import { logInfo, logWarn, logDebug } from "./logger.mjs";

const ROUTER_HOST = "127.0.0.1";
const ROUTER_PORT = 4319;

/**
 * Dispatch a claimed issue to its assigned worktree executor via the router.
 */
function dispatchToExecutor(identifier, correlationId) {
  return new Promise((resolve) => {
    const body = JSON.stringify({
      identifier,
      source: "scheduler",
      timestamp: new Date().toISOString(),
    });

    const req = http.request(
      {
        hostname: ROUTER_HOST,
        port: ROUTER_PORT,
        path: "/v1/linear/trigger",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
          Authorization: "Bearer local-symphony",
          ...(correlationId ? { "x-anqr-correlation-id": correlationId } : {}),
        },
      },
      (res) => {
        res.resume();
        res.on("end", () => resolve(res.statusCode < 400));
      },
    );

    req.on("error", (err) => {
      logWarn(`[scheduler] Dispatch failed for ${identifier}: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(10_000, () => {
      req.destroy(new Error("timeout"));
      resolve(false);
    });

    req.write(body);
    req.end();
  });
}

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
    // Pick an available worktree not yet assigned in this cycle
    const worktreeId = availableWorktrees.find((wt) => !assignedThisCycle.has(wt)) || null;

    const claim = claimIssue(issue.identifier, {
      worktreeId,
      source: "scheduler",
    });

    if (!claim.ok) {
      logDebug(
        `[scheduler] Claim rejected for ${issue.identifier}: ${claim.reason}`,
      );
      claimRejected++;
      continue;
    }

    if (worktreeId) {
      assignedThisCycle.add(worktreeId);
    }

    const ok = await dispatchToExecutor(issue.identifier, null);
    if (ok) {
      dispatched++;
      logInfo(`[scheduler] Claimed + dispatched ${issue.identifier} -> ${worktreeId || "(router-selected)"}: ${issue.title}`);
    } else {
      logWarn(`[scheduler] Dispatch failed for ${issue.identifier} after successful claim`);
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
