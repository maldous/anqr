// Generated from ../../../scripts/ops/orchestration/nightly-ops-pass.mjs:52

import { existsSync, copyFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

import { LATEST_REPORT } from "./latest-report.mjs";
import { REPORTS_DIR } from "./reports-dir.mjs";
import { logInfo } from "./logger.mjs";

export function archiveReport() {
  if (!existsSync(LATEST_REPORT)) return;
  const archiveDir = resolve(REPORTS_DIR, "archive");
  if (!existsSync(archiveDir)) mkdirSync(archiveDir, { recursive: true });
  const ts = new Date().toISOString().replaceAll(/[:.]/g, "-").replaceAll("T", "_").slice(0, 19);
  const archivePath = resolve(archiveDir, `report-${ts}.json`);
  copyFileSync(LATEST_REPORT, archivePath);
  logInfo(`[nightly] Report archived to ${archivePath}`);
}
