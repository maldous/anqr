#!/usr/bin/env node

/**
 * startup-recovery.mjs — Recovery script to run on system startup
 *
 * This script should be run automatically after system restart to:
 * 1. Reset any stale state
 * 2. Recover stuck issues
 * 3. Ensure queue is properly fed
 * 4. Verify all services are running
 *
 * Usage:
 *   node scripts/ops/tools/startup-recovery.mjs
 */

import { execFileSync } from "node:child_process";
import { listIssuesByState } from "../integrations/linear/linear-client.mjs";
import {
  getIssueState,
  releaseLease,
  clearCooldown,
  resetRetryState,
  recordTransition,
} from "../core/symphony-state.mjs";
import { feedQueue, getQueueSnapshot } from "../symphony-queue-control.mjs";
import { createLogger } from "../lib/logger.mjs";

const { logInfo, logWarn, logError } = createLogger();

function runCommand(cmd, args = [], cwd = process.cwd()) {
  try {
    const output = execFileSync(cmd, args, {
      encoding: "utf-8",
      cwd,
      stdio: "pipe",
    });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message, stderr: error.stderr?.toString?.() };
  }
}

async function main() {
  logInfo("🚀 Starting Linear webhook system startup recovery...\n");

  // Step 1: Check and enable services
  logInfo("🔧 Step 1: Checking and enabling services...");

  const servicesToEnable = [
    "anqr-linear-webhook.service",
    "anqr-symphony-router.service",
    "anqr-queue-feeder.timer",
  ];

  for (const service of servicesToEnable) {
    const checkResult = runCommand("systemctl", ["--user", "is-active", service]);

    if (checkResult.success && checkResult.output.trim() === "active") {
      logInfo(`  ✅ ${service} is already active`);
    } else {
      logWarn(`  ⚠️  ${service} is not active - attempting to enable and start`);

      const enableResult = runCommand("systemctl", ["--user", "enable", "--now", service]);

      if (enableResult.success) {
        logInfo(`  ✅ Successfully enabled and started ${service}`);
      } else {
        logError(`  ❌ Failed to enable ${service}: ${enableResult.error}`);
        logInfo(`     Try manually: systemctl --user enable --now ${service}`);
      }
    }
  }

  // Step 2: Check and enable timers
  logInfo("\n🕒 Step 2: Checking and enabling timers...");

  const timersToEnable = [
    "anqr-linear-runner@1.timer",
    "anqr-linear-runner@2.timer",
    "anqr-linear-runner@3.timer",
    "anqr-linear-runner@4.timer",
    "anqr-queue-feeder.timer",
  ];

  for (const timer of timersToEnable) {
    const checkResult = runCommand("systemctl", ["--user", "is-active", timer]);

    if (checkResult.success && checkResult.output.trim() === "active") {
      logInfo(`  ✅ ${timer} is already active`);
    } else {
      logWarn(`  ⚠️  ${timer} is not active - attempting to enable and start`);

      const enableResult = runCommand("systemctl", ["--user", "enable", "--now", timer]);

      if (enableResult.success) {
        logInfo(`  ✅ Successfully enabled and started ${timer}`);
      } else {
        logError(`  ❌ Failed to enable ${timer}: ${enableResult.error}`);
        logInfo(`     Try manually: systemctl --user enable --now ${timer}`);
      }
    }
  }

  // Step 3: Check queue health and feed if needed
  logInfo("\n📋 Step 3: Checking queue health...");

  try {
    const snap = await getQueueSnapshot();

    logInfo(`  Current queue depth: ${snap.readyDepth} issues ready`);

    // Feed up to 3 issues if queue is running low
    if (snap.readyDepth < 3) {
      logInfo(`  📥 Feeding ${3 - snap.readyDepth} issue(s) from Backlog to Todo...`);
      await feedQueue(snap, false);

      const newSnap = await getQueueSnapshot();
      logInfo(`  ✅ Queue depth after feeding: ${newSnap.readyDepth}`);
    } else {
      logInfo(`  ✅ Queue already has sufficient depth (${snap.readyDepth} issues)`);
    }
  } catch (error) {
    logError(`  ❌ Failed to check queue health: ${error.message}`);
  }

  // Step 4: Check for retry-exhausted issues and reset them
  logInfo("\n🔄 Step 4: Checking for retry-exhausted issues...");

  try {
    const backlogIssues = await listIssuesByState(["Backlog"]);
    const retryExhausted = [];

    for (const issue of backlogIssues) {
      const state = getIssueState(issue.identifier);
      if (state.retry_exhausted) {
        retryExhausted.push(issue.identifier);
      }
    }

    if (retryExhausted.length > 0) {
      logWarn(`  ⚠️  Found ${retryExhausted.length} retry-exhausted issues`);

      for (const identifier of retryExhausted) {
        try {
          resetRetryState(identifier, { retry_count: 0 });
          clearCooldown(identifier);

          recordTransition(identifier, {
            actor: "startup-recovery",
            reason: "retry_state_reset",
            from: "Backlog",
            to: "Backlog",
          });

          logInfo(`  ✅ Reset retry state for ${identifier}`);
        } catch (error) {
          logError(`  ❌ Failed to reset ${identifier}: ${error.message}`);
        }
      }

      logInfo(`\n  💡 These issues can now be fed from Backlog → Todo`);
    } else {
      logInfo("  ✅ No retry-exhausted issues found");
    }
  } catch (error) {
    logError(`  ❌ Failed to check retry state: ${error.message}`);
  }

  // Step 5: Check for stale leases
  logInfo("\n🔄 Step 5: Checking for stale leases...");

  try {
    const { findExpiredLeases } = await import("../core/symphony-state.mjs");
    const expiredLeases = findExpiredLeases();

    if (expiredLeases.length > 0) {
      logWarn(`  ⚠️  Found ${expiredLeases.length} expired leases`);

      for (const { issueIdentifier } of expiredLeases) {
        try {
          releaseLease(issueIdentifier);
          logInfo(`  ✅ Released lease for ${issueIdentifier}`);
        } catch (error) {
          logError(`  ❌ Failed to release lease for ${issueIdentifier}: ${error.message}`);
        }
      }
    } else {
      logInfo("  ✅ No expired leases found");
    }
  } catch (error) {
    logError(`  ❌ Failed to check leases: ${error.message}`);
  }

  // Step 6: Final verification
  logInfo("\n🔍 Step 6: Final verification...");

  const finalCheck = runCommand("systemctl", [
    "--user",
    "list-units",
    "--state=active",
    "--no-legend",
  ]);

  if (finalCheck.success) {
    const activeUnits = finalCheck.output
      .trim()
      .split("\n")
      .filter((line) => line.includes("anqr-") && !line.includes("retired")).length;

    logInfo(`  ✅ ${activeUnits} ANQR services are active`);
  }

  logInfo("\n🎉 Startup recovery complete!");
  logInfo("\n📊 Summary:");
  logInfo("  - Services checked and enabled");
  logInfo("  - Queue health verified and fed if needed");
  logInfo("  - Retry-exhausted issues reset");
  logInfo("  - Stale leases cleared");
  logInfo("\n✅ Linear webhook system should now be operational!");
}

await main();
