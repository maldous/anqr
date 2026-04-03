#!/usr/bin/env node

/**
 * worktree-health.mjs — Per-worktree health snapshot and fleet inventory
 *
 * Provides classification of worktree health state by combining:
 * - git dirty file detection
 * - finalization state from shared store
 * - lease/heartbeat status
 * - worktree state tracking
 *
 * Used by the recovery daemon, scheduler, and health monitoring.
 */

import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createLogger } from "../lib/logger.mjs";
import {
  getWorktreeState,
  getFleetSnapshot,
  loadState,
  leaseIsActive,
  getFinalizationState,
} from "./symphony-state.mjs";
import {
  getWorktreePath,
  DISCORD_WORKTREE_IDS,
  SYMPHONY_WORKTREE_IDS,
} from "./worktree-config.mjs";

const { logInfo } = createLogger();

const ALL_WORKTREE_IDS = [
  ...SYMPHONY_WORKTREE_IDS.filter((id) => id !== "main"),
  ...DISCORD_WORKTREE_IDS,
];

/**
 * Get git dirty files for a worktree.
 * @param {string} worktreePath
 * @returns {string[]}
 */
function getGitDirtyFiles(worktreePath) {
  try {
    const status = execFileSync("git", ["status", "--porcelain"], {
      cwd: worktreePath,
      encoding: "utf-8",
      timeout: 10_000,
    });
    return status
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Get current branch name for a worktree.
 * @param {string} worktreePath
 * @returns {string}
 */
function getCurrentBranch(worktreePath) {
  try {
    return execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      cwd: worktreePath,
      encoding: "utf-8",
      timeout: 5_000,
    }).trim();
  } catch {
    return "unknown";
  }
}

/**
 * Get HEAD sha for a worktree.
 * @param {string} worktreePath
 * @returns {string}
 */
function getHeadSha(worktreePath) {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: worktreePath,
      encoding: "utf-8",
      timeout: 5_000,
    }).trim();
  } catch {
    return "unknown";
  }
}

/**
 * Classify a worktree's health state.
 *
 * @param {string} worktreeId - e.g. "1", "5", "wt1"
 * @returns {{
 *   id: string,
 *   path: string,
 *   exists: boolean,
 *   gitDirtyFiles: string[],
 *   branch: string,
 *   headSha: string,
 *   finalizationState: object|null,
 *   leaseState: object|null,
 *   classification: string,
 *   issueIdentifier: string|null,
 *   updatedAt: string
 * }}
 */
export function getWorktreeHealthSnapshot(worktreeId) {
  const normalizedId = String(worktreeId).replace(/^wt/, "");
  const wtId = `wt${normalizedId}`;
  const path = getWorktreePath(normalizedId);
  const exists = existsSync(path);

  const snapshot = {
    id: wtId,
    path,
    exists,
    gitDirtyFiles: [],
    branch: "unknown",
    headSha: "unknown",
    finalizationState: null,
    leaseState: null,
    classification: "available",
    issueIdentifier: null,
    updatedAt: new Date().toISOString(),
  };

  if (!exists) {
    snapshot.classification = "missing";
    return snapshot;
  }

  snapshot.gitDirtyFiles = getGitDirtyFiles(path);
  snapshot.branch = getCurrentBranch(path);
  snapshot.headSha = getHeadSha(path);

  // Check stored worktree state
  const wtState = getWorktreeState(wtId);
  if (wtState) {
    snapshot.issueIdentifier = wtState.issueIdentifier || null;
  }

  // Check for active issue lease
  const store = loadState();
  let activeIssueIdentifier = null;
  let activeLease = null;
  for (const [identifier, record] of Object.entries(store.issues)) {
    if (record.lease && record.finalization?.worktreeId === wtId) {
      activeLease = record.lease;
      activeIssueIdentifier = identifier;
      break;
    }
  }
  snapshot.leaseState = activeLease;
  if (activeIssueIdentifier) {
    snapshot.issueIdentifier = activeIssueIdentifier;
    snapshot.finalizationState = getFinalizationState(activeIssueIdentifier);
  }

  // If worktree state was explicitly set, prefer it
  if (wtState?.state === "quarantined") {
    snapshot.classification = "quarantined";
    return snapshot;
  }

  // Classification logic
  const hasDirtyFiles = snapshot.gitDirtyFiles.length > 0;
  const hasActiveLease = activeLease && leaseIsActive({ lease: activeLease });
  const finState = snapshot.finalizationState;
  const isRepairable =
    finState &&
    [
      "validation_failed_repairable",
      "commit_failed_repairable",
      "branch_push_failed_repairable",
      "integration_failed_repairable",
    ].includes(finState.state);

  if (hasActiveLease) {
    snapshot.classification = "executing";
  } else if (hasDirtyFiles && isRepairable && finState.stickyOwner === wtId) {
    snapshot.classification = "dirty_owned";
  } else if (hasDirtyFiles && !isRepairable && !hasActiveLease) {
    snapshot.classification = "dirty_orphaned";
  } else if (isRepairable && finState.stickyOwner === wtId) {
    snapshot.classification = "dirty_owned";
  } else if (wtState?.state === "blocked") {
    snapshot.classification = "blocked";
  } else {
    snapshot.classification = "available";
  }

  return snapshot;
}

/**
 * Get fleet-wide inventory of all worktrees.
 *
 * @returns {{
 *   worktrees: object[],
 *   summary: { available: number, executing: number, dirty: number, quarantined: number, blocked: number, missing: number },
 *   timestamp: string
 * }}
 */
export function getFleetInventory() {
  const worktrees = [];
  const summary = { available: 0, executing: 0, dirty: 0, quarantined: 0, blocked: 0, missing: 0 };

  for (const id of ALL_WORKTREE_IDS) {
    const snapshot = getWorktreeHealthSnapshot(id);
    worktrees.push(snapshot);

    if (snapshot.classification === "dirty_owned" || snapshot.classification === "dirty_orphaned") {
      summary.dirty++;
    } else if (summary[snapshot.classification] !== undefined) {
      summary[snapshot.classification]++;
    }
  }

  return {
    worktrees,
    summary,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Write fleet health to a JSON file for external observability.
 * @param {string} outputPath - defaults to reports/symphony/fleet-health.json
 */
export function writeFleetHealthFile(outputPath) {
  const defaultPath = resolve(
    dirname(new URL(import.meta.url).pathname),
    "..",
    "..",
    "..",
    "reports",
    "symphony",
    "fleet-health.json",
  );
  const targetPath = outputPath || defaultPath;
  const dir = dirname(targetPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const inventory = getFleetInventory();
  const fleetState = getFleetSnapshot();

  const report = {
    ...inventory,
    stateStore: fleetState,
    generatedAt: new Date().toISOString(),
  };

  writeFileSync(targetPath, JSON.stringify(report, null, 2) + "\n");
  logInfo(`[health] Fleet health written to ${targetPath}`);
  return targetPath;
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const cmd = process.argv[2];
  if (cmd === "snapshot") {
    const wtId = process.argv[3];
    if (!wtId) {
      console.error("Usage: worktree-health.mjs snapshot <worktreeId>");
      process.exit(2);
    }
    console.log(JSON.stringify(getWorktreeHealthSnapshot(wtId), null, 2));
  } else if (cmd === "inventory") {
    console.log(JSON.stringify(getFleetInventory(), null, 2));
  } else if (cmd === "write") {
    writeFleetHealthFile(process.argv[3]);
  } else {
    console.error("Usage: worktree-health.mjs <snapshot <id>|inventory|write [path]>");
    process.exit(2);
  }
}
