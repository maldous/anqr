import { resolve } from "node:path";
import { readFileSync, existsSync } from "node:fs";

import { ROOT } from "./root.mjs";
import { logError } from "./logger.mjs";

export async function getHarnessStatus() {
  const reportPath = resolve(ROOT, "reports/latest.json");
  if (!existsSync(reportPath)) return null;

  try {
    const report = JSON.parse(readFileSync(reportPath, "utf-8"));
    const failedChecks = new Set(report.checks.filter((c) => !c.pass).map((c) => c.name));
    return failedChecks;
  } catch (err) {
    logError(`Failed to read harness report: ${err.message}`);
    return null;
  }
}
