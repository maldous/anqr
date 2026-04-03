#!/usr/bin/env node

/**
 * incident-evidence.mjs — Evidence collection for auto-created incidents
 */

import { execSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { getAllProviderHealthStates } from "../model/symphony-provider-health.mjs";
import { createLogger } from "../../lib/logger.mjs";

const { logWarn } = createLogger();

/**
 * Get service journal logs
 */
function getServiceJournal(serviceName, lines = 100) {
  try {
    const output = execSync(
      `journalctl --user -u ${serviceName} -n ${lines} --no-pager 2>&1 || true`,
      { encoding: "utf-8", timeout: 10000 },
    );
    return output;
  } catch {
    return "";
  }
}

/**
 * Get current git context
 */
function getGitContext() {
  try {
    const commit = execSync("git rev-parse --short HEAD", {
      encoding: "utf-8",
      timeout: 5000,
    }).trim();

    const branch = execSync("git rev-parse --abbrev-ref HEAD", {
      encoding: "utf-8",
      timeout: 5000,
    }).trim();

    const statusOutput = execSync("git status --porcelain", {
      encoding: "utf-8",
      timeout: 5000,
    });

    const hasUncommitted = statusOutput.trim().length > 0;

    return { commit, branch, hasUncommitted };
  } catch (err) {
    logWarn(`Failed to get git context: ${err.message}`);
    return { commit: "unknown", branch: "unknown", hasUncommitted: false };
  }
}

/**
 * Get system information
 */
function getSystemInfo() {
  try {
    const hostname = execSync("hostname", { encoding: "utf-8", timeout: 2000 }).trim();
    const uptime = execSync("uptime -p", { encoding: "utf-8", timeout: 2000 }).trim();

    // Get memory info (Linux-specific)
    let memFree = "unknown";
    if (existsSync("/proc/meminfo")) {
      const meminfo = execSync("grep MemAvailable /proc/meminfo", {
        encoding: "utf-8",
        timeout: 2000,
      });
      const match = meminfo.match(/(\d+)/);
      if (match) {
        const memKB = parseInt(match[1], 10);
        memFree = `${Math.round(memKB / 1024)} MB`;
      }
    }

    return { hostname, uptime, memFree };
  } catch (err) {
    logWarn(`Failed to get system info: ${err.message}`);
    return { hostname: "unknown", uptime: "unknown", memFree: "unknown" };
  }
}

/**
 * Get state file info if it exists
 */
function getStateFileInfo() {
  try {
    const stateDir =
      process.env.ANQR_SYMPHONY_STATE_DIR ||
      `${process.env.XDG_RUNTIME_DIR || "/tmp"}/anqr-symphony-state`;
    const stateFile = `${stateDir}/state.json`;

    if (existsSync(stateFile)) {
      const stats = statSync(stateFile);
      return {
        size: `${Math.round(stats.size / 1024)} KB`,
        modified: stats.mtime.toISOString(),
      };
    }
  } catch {
    // Ignore errors
  }
  return null;
}

/**
 * Collect comprehensive incident evidence
 *
 * @param {string} serviceName - systemd service name (optional)
 * @param {object} errorContext - Additional error context
 * @returns {object} Evidence bundle
 */
export async function collectIncidentEvidence(serviceName = null, errorContext = {}) {
  const evidence = {
    timestamp: new Date().toISOString(),
    errorContext,
    gitContext: getGitContext(),
    systemInfo: getSystemInfo(),
    providerHealth: getAllProviderHealthStates(),
    stateFile: getStateFileInfo(),
  };

  if (serviceName) {
    evidence.serviceName = serviceName;
    evidence.journalLog = getServiceJournal(serviceName, 100);
  }

  return evidence;
}

/**
 * Format evidence for Linear issue description
 */
export function formatEvidenceForIssue(evidence) {
  const lines = [];

  lines.push("## Incident Evidence");
  lines.push("");
  lines.push(`**Timestamp:** ${evidence.timestamp}`);
  lines.push("");

  if (evidence.serviceName) {
    lines.push("### Service");
    lines.push(`- **Name:** ${evidence.serviceName}`);
    lines.push("");
  }

  if (evidence.errorContext && Object.keys(evidence.errorContext).length > 0) {
    lines.push("### Error Context");
    for (const [key, value] of Object.entries(evidence.errorContext)) {
      lines.push(`- **${key}:** ${value}`);
    }
    lines.push("");
  }

  if (evidence.gitContext) {
    lines.push("### Git Context");
    lines.push(`- **Commit:** \`${evidence.gitContext.commit}\``);
    lines.push(`- **Branch:** ${evidence.gitContext.branch}`);
    lines.push(`- **Uncommitted changes:** ${evidence.gitContext.hasUncommitted ? "Yes" : "No"}`);
    lines.push("");
  }

  if (evidence.systemInfo) {
    lines.push("### System Info");
    lines.push(`- **Hostname:** ${evidence.systemInfo.hostname}`);
    lines.push(`- **Uptime:** ${evidence.systemInfo.uptime}`);
    lines.push(`- **Memory available:** ${evidence.systemInfo.memFree}`);
    lines.push("");
  }

  if (evidence.stateFile) {
    lines.push("### State File");
    lines.push(`- **Size:** ${evidence.stateFile.size}`);
    lines.push(`- **Last modified:** ${evidence.stateFile.modified}`);
    lines.push("");
  }

  if (evidence.providerHealth && Object.keys(evidence.providerHealth).length > 0) {
    lines.push("### Provider Health");
    lines.push("");
    for (const [provider, health] of Object.entries(evidence.providerHealth)) {
      lines.push(`**${provider}:**`);
      lines.push(`- State: ${health.state}`);
      lines.push(`- Consecutive failures: ${health.consecutiveFailures || 0}`);
      lines.push(`- Consecutive successes: ${health.consecutiveSuccesses || 0}`);
      if (health.lastErrorType) {
        lines.push(`- Last error: ${health.lastErrorType}`);
      }
      lines.push("");
    }
  }

  if (evidence.journalLog) {
    lines.push("### Service Journal (last 100 lines)");
    lines.push("");
    lines.push("```");
    lines.push(evidence.journalLog.trim());
    lines.push("```");
    lines.push("");
  }

  return lines.join("\n");
}
