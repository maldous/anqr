#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createLogger } from "../lib/logger.mjs";

const { logInfo, logError } = createLogger();

/**
 * Symphony Runner Control Script
 * 
 * Controls the systemd timers that feed the Symphony runner queue.
 * 
 * Usage:
 *   node scripts/ops/orchestration/symphony-control.mjs --stop     # Stop all runners (disable timers)
 *   node scripts/ops/orchestration/symphony-control.mjs --start    # Start all runners (enable timers)
 *   node scripts/ops/orchestration/symphony-control.mjs --status   # Show runner status
 *   node scripts/ops/orchestration/symphony-control.mjs --restart  # Restart all runners (disable + enable)
 */

function getTimerStatus() {
  try {
    const output = execFileSync("systemctl", ["--user", "list-timers", "anqr-symphony-runner@*.timer", "--all"], {
      encoding: "utf-8",
    });
    return output;
  } catch (err) {
    logError(`Failed to get timer status: ${err.message}`);
    return null;
  }
}

function getEnabledTimers() {
  try {
    const output = execFileSync(
      "systemctl",
      ["--user", "list-timers", "anqr-symphony-runner@*.timer", "--all", "--no-legend"],
      { encoding: "utf-8" },
    );
    const lines = output
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    return lines
      .map((line) => line.split(/\s+/).slice(-2, -1)[0])
      .filter((unit) => unit?.startsWith("anqr-symphony-runner@"));
  } catch {
    return [];
  }
}

function disableAllTimers() {
  logInfo("🛑 Disabling all Symphony runner timers...");
  try {
    // Stop any currently running timers
    execFileSync("systemctl", ["--user", "stop", "anqr-symphony-runner@*.timer"], {
      stdio: "pipe",
    });
    
    // Disable timers to prevent restart
    execFileSync("systemctl", ["--user", "disable", "anqr-symphony-runner@*.timer"], {
      stdio: "pipe",
    });
    
    logInfo("✅ All Symphony runner timers disabled");
    logInfo("⏸️  No new tasks will be picked up until timers are re-enabled");
    return true;
  } catch (err) {
    logError(`Failed to disable timers: ${err.message}`);
    return false;
  }
}

function enableAllTimers() {
  logInfo("▶️  Enabling all Symphony runner timers...");
  try {
    // Enable standard runners (wt1-wt4) and Discord runners (wt5-wt8)
    const runners = ["1", "2", "3", "4", "5", "6", "7", "8"];
    for (const id of runners) {
      execFileSync("systemctl", ["--user", "enable", `anqr-symphony-runner@${id}.timer`], {
        stdio: "pipe",
      });
      execFileSync("systemctl", ["--user", "start", `anqr-symphony-runner@${id}.timer`], {
        stdio: "pipe",
      });
    }
    
    logInfo("✅ All Symphony runner timers enabled and started");
    logInfo("🚀 Runners will begin picking up tasks on next timer cycle");
    return true;
  } catch (err) {
    logError(`Failed to enable timers: ${err.message}`);
    return false;
  }
}

function showStatus() {
  logInfo("📊 Symphony Runner System Status\n");
  
  const timerStatus = getTimerStatus();
  if (timerStatus) {
    console.log(timerStatus);
  }
  
  const enabledTimers = getEnabledTimers();
  logInfo(`\n🔧 Enabled timers: ${enabledTimers.length}`);
  if (enabledTimers.length > 0) {
    logInfo("  Status: ✅ RUNNING - new tasks will be picked up");
    for (const timer of enabledTimers) {
      logInfo(`  - ${timer}`);
    }
  } else {
    logInfo("  Status: 🛑 STOPPED - no new tasks will be picked up");
  }
}

async function main() {
  const args = new Set(process.argv.slice(2));
  
  if (args.has("--stop")) {
    const success = disableAllTimers();
    process.exit(success ? 0 : 1);
  } else if (args.has("--start")) {
    const success = enableAllTimers();
    process.exit(success ? 0 : 1);
  } else if (args.has("--restart")) {
    disableAllTimers();
    await new Promise(resolve => setTimeout(resolve, 2000));
    const success = enableAllTimers();
    process.exit(success ? 0 : 1);
  } else if (args.has("--status")) {
    showStatus();
    process.exit(0);
  } else {
    logError("Usage: symphony-control.mjs --stop|--start|--restart|--status");
    logInfo("");
    logInfo("  --stop     Disable all runner timers (stop picking new tasks)");
    logInfo("  --start    Enable all runner timers (start picking new tasks)");
    logInfo("  --restart  Restart all runner timers");
    logInfo("  --status   Show current timer status");
    process.exit(2);
  }
}

await main();
