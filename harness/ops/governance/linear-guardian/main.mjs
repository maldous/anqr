import { readFileSync, existsSync } from "node:fs";
import { getQueueDepth } from "../../linear-client.mjs";
import { TARGET_MAX } from "../../symphony-config.mjs";

import { REPORT_PATH } from "./report-path.mjs";
import { checkStaleIssues } from "./check-stale-issues.mjs";
import { logAction } from "./log-action.mjs";
import { printSummary } from "./print-summary.mjs";
import { processFailingCheck } from "./process-failing-check.mjs";
import { logInfo, logError, logDebug } from "./logger.mjs";

export async function main() {
  const dryRun = process.argv.includes("--dry-run");

  logInfo(`[linear-guardian]${dryRun ? " (DRY RUN)" : ""} starting\n`);

  if (!existsSync(REPORT_PATH)) {
    logError(`[linear-guardian] No report found at ${REPORT_PATH}`);
    logError("[linear-guardian] Run harness-report.mjs first.");
    process.exit(1);
  }

  const report = JSON.parse(readFileSync(REPORT_PATH, "utf-8"));
  const failures = report.checks.filter((c) => !c.pass);

  logDebug(
    `[linear-guardian] Report: ${report.profile} profile, ${report.summary.passed}/${report.summary.total} passed, ${failures.length} failures`,
  );
  logDebug(`[linear-guardian] Report timestamp: ${report.timestamp}\n`);

  if (failures.length === 0) {
    logAction("info", "No harness failures — nothing to do");
    printSummary();
    process.exit(0);
  }

  const queue = await getQueueDepth();
  let currentDepth = queue.automatable;
  logDebug(
    `[linear-guardian] Queue depth: ${currentDepth} automatable / ${queue.total} total (max: ${TARGET_MAX})\n`,
  );

  for (const check of failures) {
    const newDepth = await processFailingCheck(check, report, currentDepth, dryRun);
    if (typeof newDepth === "number") {
      currentDepth = newDepth;
    }
  }

  logInfo("");
  const staleCount = await checkStaleIssues(dryRun);
  if (staleCount === 0) {
    logAction("info", "No stale in-progress issues");
  }

  logInfo("");
  printSummary();
  process.exit(0);
}
