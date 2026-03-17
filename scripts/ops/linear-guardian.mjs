#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * linear-guardian.mjs — Deterministic guardian logic
 *
 * Replaces the legacy AI-first Sentinel with rule-based control.
 *
 * Responsibilities:
 *   - Read harness reports (from reports/latest.json)
 *   - Create or update Linear issues based on harness failures
 *   - Duplicate suppression (don't re-create known issues)
 *   - Queue-size control (enforce target_max)
 *   - Stale-session escalation
 *   - Hygiene enforcement (labels, descriptors)
 *
 * Usage:
 *   LINEAR_API_KEY=... node scripts/ops/linear-guardian.mjs
 *   LINEAR_API_KEY=... node scripts/ops/linear-guardian.mjs --dry-run
 *
 * Exit code:
 *   0 = guardian pass completed
 *   1 = error reading report or communicating with Linear
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createIssue,
  updateIssue,
  findOpenIssuesByTitle,
  addComment,
  getQueueDepth,
  listIssuesByState,
  STATES,
  LABELS,
} from "./linear-client.mjs";
import {
  TARGET_MAX,
  STALE_THRESHOLD_MS,
  TITLE_PREFIX,
  REQUIRED_LABEL_IDS,
} from "./symphony-config.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(__dirname, "..", "..");
const REPORT_PATH = resolve(ROOT, "reports/latest.json");

const CHECK_METADATA = {
  "repo-structure": {
    summary: "Repository structure violation detected",
    priority: 2,
    extraLabels: [],
  },
  typecheck: {
    summary: "TypeScript typecheck failure",
    priority: 2,
    extraLabels: [],
  },
  lint: {
    summary: "Lint violations detected (oxlint)",
    priority: 3,
    extraLabels: [],
  },
  "test-unit": {
    summary: "Unit test failure (vitest)",
    priority: 1,
    extraLabels: [LABELS.bug],
  },
  depcruise: {
    summary: "Dependency graph violation (dependency-cruiser)",
    priority: 2,
    extraLabels: [],
  },
  "docs-freshness": {
    summary: "Documentation freshness check failed",
    priority: 4,
    extraLabels: [],
  },
  "ollama-health": {
    summary: "Ollama model health check failed",
    priority: 2,
    extraLabels: [],
  },
  "litellm-routing": {
    summary: "LiteLLM routing configuration invalid",
    priority: 2,
    extraLabels: [],
  },
};

function buildIssueTitle(checkName) {
  return `${TITLE_PREFIX}: ${checkName} failure`;
}

function buildIssueBody(check, report) {
  const lines = [
    `## ${CHECK_METADATA[check.name]?.summary || check.name}`,
    "",
    `**Check:** \`${check.name}\``,
    `**Profile:** ${report.profile}`,
    `**Detected:** ${report.timestamp}`,
    `**Duration:** ${check.duration_ms}ms`,
    "",
    "### Detail",
    "",
    "```",
    check.detail,
    "```",
    "",
    "---",
    "*Auto-created by linear-guardian.mjs*",
  ];
  return lines.join("\n");
}

function buildCommentBody(check, report) {
  const lines = [
    `**Still failing** as of ${report.timestamp} (profile: ${report.profile})`,
    "",
    "```",
    check.detail,
    "```",
  ];
  return lines.join("\n");
}

function isStale(issue) {
  const updated = new Date(issue.updatedAt).getTime();
  return Date.now() - updated > STALE_THRESHOLD_MS;
}

function issueNeedsLabelHygiene(issue) {
  const existing = new Set((issue.labels?.nodes || []).map((l) => l.id));
  return REQUIRED_LABEL_IDS.some((id) => !existing.has(id));
}

function mergedLabelIds(issue) {
  const existing = (issue.labels?.nodes || []).map((l) => l.id);
  const merged = new Set([...existing, ...REQUIRED_LABEL_IDS]);
  return [...merged];
}

// ---------------------------------------------------------------------------
// Guardian actions
// ---------------------------------------------------------------------------

const actions = [];

function logAction(type, detail) {
  const entry = { type, detail, ts: new Date().toISOString() };
  actions.push(entry);
  const icons = { create: "🆕", comment: "💬", hygiene: "🏷️", skip: "⏭️", stale: "⏰", info: "ℹ️" };
  console.log(`${icons[type] || "•"} ${type}: ${detail}`);
}

async function processFailingCheck(check, report, queueDepth, dryRun) {
  const title = buildIssueTitle(check.name);
  const meta = CHECK_METADATA[check.name] || { summary: check.name, priority: 3, extraLabels: [] };

  const existing = await findOpenIssuesByTitle(title);
  const exact = existing.filter((i) => i.title === title);

  if (exact.length > 0) {
    const issue = exact[0];
    const body = buildCommentBody(check, report);

    if (dryRun) {
      logAction("comment", `[DRY RUN] Would comment on ${issue.identifier}: ${title}`);
    } else {
      await addComment(issue.id, body);
      logAction("comment", `Commented on ${issue.identifier}: ${title}`);
    }

    if (issueNeedsLabelHygiene(issue)) {
      const labels = mergedLabelIds(issue);
      if (dryRun) {
        logAction("hygiene", `[DRY RUN] Would enforce labels on ${issue.identifier}`);
      } else {
        await updateIssue(issue.id, { labelIds: labels });
        logAction("hygiene", `Enforced labels on ${issue.identifier}`);
      }
    }

    return;
  }

  if (queueDepth >= TARGET_MAX) {
    logAction("skip", `Queue full (${queueDepth}/${TARGET_MAX}), skipping: ${title}`);
    return;
  }

  const labelIds = [...REQUIRED_LABEL_IDS, ...meta.extraLabels];
  const input = {
    title,
    description: buildIssueBody(check, report),
    stateId: STATES.backlog,
    priority: meta.priority,
    labelIds,
  };

  if (dryRun) {
    logAction(
      "create",
      `[DRY RUN] Would create: ${title} (P${meta.priority}, ${labelIds.length} labels)`,
    );
  } else {
    const issue = await createIssue(input);
    logAction("create", `Created ${issue.identifier}: ${title}`);
  }

  queueDepth++;
  return queueDepth;
}

async function checkStaleIssues(dryRun) {
  const inProgress = await listIssuesByState(["In Progress"]);
  const stale = inProgress.filter(isStale);

  for (const issue of stale) {
    const age = Math.floor((Date.now() - new Date(issue.updatedAt).getTime()) / 60_000);
    if (dryRun) {
      logAction(
        "stale",
        `[DRY RUN] Would escalate ${issue.identifier}: stale ${age}min (${issue.title})`,
      );
    } else {
      await addComment(
        issue.id,
        `⏰ **Stale execution detected** — no update for ${age} minutes. Escalating.`,
      );
      logAction("stale", `Escalated ${issue.identifier}: stale ${age}min (${issue.title})`);
    }
  }

  return stale.length;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  console.log(`[linear-guardian]${dryRun ? " (DRY RUN)" : ""} starting\n`);

  if (!existsSync(REPORT_PATH)) {
    console.error(`[linear-guardian] No report found at ${REPORT_PATH}`);
    console.error("[linear-guardian] Run harness-report.mjs first.");
    process.exit(1);
  }

  const report = JSON.parse(readFileSync(REPORT_PATH, "utf-8"));
  const failures = report.checks.filter((c) => !c.pass);

  console.log(
    `[linear-guardian] Report: ${report.profile} profile, ${report.summary.passed}/${report.summary.total} passed, ${failures.length} failures`,
  );
  console.log(`[linear-guardian] Report timestamp: ${report.timestamp}\n`);

  if (failures.length === 0) {
    logAction("info", "No harness failures — nothing to do");
    printSummary();
    process.exit(0);
  }

  const queue = await getQueueDepth();
  let currentDepth = queue.automatable;
  console.log(
    `[linear-guardian] Queue depth: ${currentDepth} automatable / ${queue.total} total (max: ${TARGET_MAX})\n`,
  );

  for (const check of failures) {
    const newDepth = await processFailingCheck(check, report, currentDepth, dryRun);
    if (typeof newDepth === "number") {
      currentDepth = newDepth;
    }
  }

  console.log("");
  const staleCount = await checkStaleIssues(dryRun);
  if (staleCount === 0) {
    logAction("info", "No stale in-progress issues");
  }

  console.log("");
  printSummary();
  process.exit(0);
}

function printSummary() {
  const counts = {};
  for (const a of actions) {
    counts[a.type] = (counts[a.type] || 0) + 1;
  }
  const parts = Object.entries(counts).map(([k, v]) => `${k}=${v}`);
  console.log(`[linear-guardian] Summary: ${parts.join(", ") || "no actions"}`);
}

await main();
