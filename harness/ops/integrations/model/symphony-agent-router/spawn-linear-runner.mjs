// Generated from ../../../../scripts/ops/integrations/model/symphony-agent-router.mjs:211

import { spawn } from "node:child_process";

import { MAX_QUEUE_LENGTH } from "./max-queue-length.mjs";
import { WORKTREES } from "./worktrees.mjs";
import { globalActiveRequests, setGlobalActiveRequests } from "./global-active-requests.mjs";
import { linearQueue } from "./linear-queue.mjs";
import { logInfo, logWarn, logError } from "./logger.mjs";

export function spawnLinearRunner(identifier) {
  const linearWorktrees = WORKTREES.filter((w) => w.id >= 1 && w.id <= 4);
  const target = linearWorktrees.sort((a, b) => a.activeRequests - b.activeRequests)[0];

  if (!target || target.activeRequests >= 1) {
    if (linearQueue.length >= MAX_QUEUE_LENGTH) {
      logWarn(`Queue full, dropping re-queue for ${identifier}`);
      return;
    }
    logWarn(`No available worktree for ${identifier}, re-queuing`);
    linearQueue.push({ identifier, queuedAt: new Date().toISOString() });
    return;
  }

  logInfo(`Linear trigger: ${identifier} -> spawning runner in wt${target.id}`);

  // Increment active requests so subsequent triggers route to other worktrees
  target.activeRequests += 1;
  setGlobalActiveRequests(globalActiveRequests + 1);
  logInfo(
    `Linear worktree load: wt1=${WORKTREES[0].activeRequests}, wt2=${WORKTREES[1].activeRequests}, wt3=${WORKTREES[2].activeRequests}, wt4=${WORKTREES[3].activeRequests}`,
  );

  // Spawn the runner in the target worktree
  const nodePath = process.execPath || "/home/user/.nvm/versions/node/v25.8.0/bin/node";

  const runner = spawn(
    nodePath,
    ["scripts/ops/orchestration/symphony-runner.mjs", "--once", "--issue", identifier],
    {
      cwd: target.path,
      env: {
        ...process.env,
        ANQR_WORKTREE_ID: `wt${target.id}`,
        ANQR_WORKTREE_PATH: target.path,
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  runner.stdout.on("data", (data) => logInfo(`[runner-wt${target.id}] ${data}`));
  runner.stderr.on("data", (data) => logError(`[runner-wt${target.id}] ${data}`));
  runner.on("close", (code) => {
    target.activeRequests = Math.max(0, target.activeRequests - 1);
    setGlobalActiveRequests(Math.max(0, globalActiveRequests - 1));
    logInfo(
      `Runner for ${identifier} exited with code ${code} (load: wt1=${WORKTREES[0].activeRequests}, wt2=${WORKTREES[1].activeRequests}, wt3=${WORKTREES[2].activeRequests}, wt4=${WORKTREES[3].activeRequests})`,
    );
  });
  runner.on("error", (err) => {
    target.activeRequests = Math.max(0, target.activeRequests - 1);
    setGlobalActiveRequests(Math.max(0, globalActiveRequests - 1));
    logError(`Failed to spawn runner for ${identifier}: ${err.message}`);
  });
}
