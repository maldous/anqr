#!/usr/bin/env node

/**
 * verify-webhook-system.mjs — Verify Linear webhook system is working correctly
 * 
 * This script checks:
 * 1. Webhook receiver is running
 * 2. Symphony router is running
 * 3. Executors are running
 * 4. Queue state is healthy
 * 5. Issues can be fed from Backlog to Todo
 * 
 * Usage:
 *   node scripts/ops/tools/verify-webhook-system.mjs
 */

import { execFileSync } from "node:child_process";
import { listIssuesByState } from "../integrations/linear/linear-client.mjs";
import { getIssueState } from "../core/symphony-state.mjs";
import { getQueueSnapshot, feedQueue } from "../orchestration/symphony-queue-control.mjs";
import { createLogger } from "../lib/logger.mjs";

const { logInfo, logWarn, logError } = createLogger();

function checkSystemdService(serviceName) {
  try {
    const output = execFileSync(
      "systemctl",
      ["--user", "is-active", serviceName],
      { encoding: "utf-8" }
    );
    return output.trim() === "active";
  } catch {
    return false;
  }
}

function checkSystemdTimer(timerName) {
  try {
    const output = execFileSync(
      "systemctl",
      ["--user", "is-active", timerName],
      { encoding: "utf-8" }
    );
    return output.trim() === "active";
  } catch {
    return false;
  }
}

function getSystemdStatus(serviceName) {
  try {
    const output = execFileSync(
      "systemctl",
      ["--user", "status", serviceName],
      { encoding: "utf-8" }
    );
    return output;
  } catch (error) {
    return error.stdout || error.stderr || `Service ${serviceName} not found`;
  }
}

async function main() {
  logInfo("🔍 Verifying Linear webhook system...\n");

  // Check systemd services
  const servicesToCheck = [
    "anqr-linear-webhook.service",
    "anqr-symphony-router.service",
    "anqr-queue-feeder.service",
    "anqr-queue-feeder.timer"
  ];

  const activeServices = [];
  const inactiveServices = [];

  for (const service of servicesToCheck) {
    const isActive = checkSystemdService(service);
    if (isActive) {
      activeServices.push(service);
    } else {
      inactiveServices.push(service);
    }
  }

  logInfo("📊 Systemd Services Status:");
  if (activeServices.length > 0) {
    logInfo("  ✅ Active services:");
    for (const service of activeServices) {
      logInfo(`    - ${service}`);
    }
  }
  
  if (inactiveServices.length > 0) {
    logWarn("  ⚠️  Inactive services:");
    for (const service of inactiveServices) {
      logWarn(`    - ${service}`);
      // Show status for inactive services
      const status = getSystemdStatus(service);
      logInfo(`      Status: ${status.split('\n')[0]}`);
    }
  }

  // Check timers
  const timersToCheck = [
    "anqr-linear-runner@1.timer",
    "anqr-linear-runner@2.timer",
    "anqr-linear-runner@3.timer",
    "anqr-linear-runner@4.timer",
    "anqr-queue-feeder.timer"
  ];

  const activeTimers = [];
  const inactiveTimers = [];

  for (const timer of timersToCheck) {
    const isActive = checkSystemdTimer(timer);
    if (isActive) {
      activeTimers.push(timer);
    } else {
      inactiveTimers.push(timer);
    }
  }

  logInfo("\n🕒 Systemd Timers Status:");
  if (activeTimers.length > 0) {
    logInfo("  ✅ Active timers:");
    for (const timer of activeTimers) {
      logInfo(`    - ${timer}`);
    }
  }
  
  if (inactiveTimers.length > 0) {
    logWarn("  ⚠️  Inactive timers:");
    for (const timer of inactiveTimers) {
      logWarn(`    - ${timer}`);
    }
  }

  // Check queue health
  logInfo("\n📋 Queue Health Check:");
  try {
    const snap = await getQueueSnapshot();
    
    logInfo(`  Backlog (feed-eligible): ${snap.backlog.automatable.length}/${snap.backlog.all.length}`);
    logInfo(`  Todo (runnable): ${snap.todo.automatable.length}/${snap.todo.all.length}`);
    logInfo(`  In Progress (managed): ${snap.inProgress.automatable.length}/${snap.inProgress.all.length}`);
    logInfo(`  Ready depth (Todo count): ${snap.readyDepth}`);
    
    if (snap.readyDepth < 3) {
      logWarn("  ⚠️  Queue is running low - consider feeding more issues");
    }
    
    if (snap.queueDepth > 10) {
      logWarn("  ⚠️  Queue is getting full - consider draining overflow");
    }
  } catch (error) {
    logError(`  ❌ Failed to get queue snapshot: ${error.message}`);
  }

  // Check for retry-exhausted issues
  logInfo("\n🔄 Retry State Check:");
  try {
    const backlogIssues = await listIssuesByState(["Backlog"]);
    const retryExhausted = [];
    
    for (const issue of backlogIssues) {
      const state = getIssueState(issue.identifier);
      if (state.retry_exhausted) {
        retryExhausted.push({
          identifier: issue.identifier,
          title: issue.title,
          reason: state.blocked_reason || "retry_exhausted"
        });
      }
    }
    
    if (retryExhausted.length > 0) {
      logWarn(`  ⚠️  Found ${retryExhausted.length} retry-exhausted issues:`);
      for (const issue of retryExhausted) {
        logWarn(`    - ${issue.identifier}: ${issue.reason}`);
      }
      logInfo("\n  💡 Run: node scripts/ops/tools/reset-retry-exhausted.mjs --all");
    } else {
      logInfo("  ✅ No retry-exhausted issues found");
    }
  } catch (error) {
    logError(`  ❌ Failed to check retry state: ${error.message}`);
  }

  // Check for stale In Progress issues
  logInfo("\n🔄 Stale Work Detection:");
  try {
    const inProgressIssues = await listIssuesByState(["In Progress"]);
    const staleIssues = [];
    const now = Date.now();
    
    for (const issue of inProgressIssues) {
      const state = getIssueState(issue.identifier);
      const ageMs = now - new Date(issue.updatedAt).getTime();
      const hasActiveLease = state.lease && new Date(state.lease.expires_at).getTime() > now;
      
      if (ageMs > 120 * 60 * 1000 && !hasActiveLease) { // 2 hours
        staleIssues.push({
          identifier: issue.identifier,
          title: issue.title,
          ageMinutes: Math.floor(ageMs / 60000)
        });
      }
    }
    
    if (staleIssues.length > 0) {
      logWarn(`  ⚠️  Found ${staleIssues.length} stale In Progress issues:`);
      for (const issue of staleIssues) {
        logWarn(`    - ${issue.identifier} (${issue.ageMinutes} minutes old)`);
      }
      logInfo("\n  💡 Run: node scripts/ops/tools/recover-stale-in-progress.mjs --dry-run");
    } else {
      logInfo("  ✅ No stale In Progress issues found");
    }
  } catch (error) {
    logError(`  ❌ Failed to check stale work: ${error.message}`);
  }

  // Test feeding queue
  logInfo("\n🔄 Testing Queue Feeding:");
  try {
    const snap = await getQueueSnapshot();
    const deficit = 3 - snap.readyDepth;
    
    if (deficit > 0) {
      logInfo(`  📥 Feeding ${deficit} issue(s) from Backlog to Todo...`);
      await feedQueue(snap, false);
      
      const newSnap = await getQueueSnapshot();
      logInfo(`  ✅ Queue depth: ${newSnap.readyDepth} (was ${snap.readyDepth})`);
    } else {
      logInfo("  ✅ Queue already has sufficient depth");
    }
  } catch (error) {
    logError(`  ❌ Failed to feed queue: ${error.message}`);
  }

  logInfo("\n✅ Verification complete!");
  logInfo("\n📚 Next steps:");
  logInfo("  - Enable any inactive services with: systemctl --user enable --now <service>");
  logInfo("  - Reset retry-exhausted issues if needed");
  logInfo("  - Monitor queue depth and runner activity");
}

await main();