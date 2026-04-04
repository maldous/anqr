// Generated from ../../../scripts/ops/notifications/notify.mjs:109

import { readFileSync, existsSync } from "node:fs";
import { sendNotification } from "../../lib/notify.mjs";

import { REPORT_PATH } from "./report-path.mjs";
import { formatEmailBody } from "./format-email-body.mjs";
import { formatStdout } from "./format-stdout.mjs";
import { parseArgs } from "./parse-args.mjs";
import { logInfo, logError } from "./logger.mjs";

export async function main() {
  const { dryRun, channel } = parseArgs();

  logInfo(`[notify]${dryRun ? " (DRY RUN)" : ""} channel=${channel}\n`);

  if (!existsSync(REPORT_PATH)) {
    logError(`[notify] No report found at ${REPORT_PATH}`);
    logError("[notify] Run harness-report.mjs first.");
    process.exit(1);
  }

  const report = JSON.parse(readFileSync(REPORT_PATH, "utf-8"));

  // stdout channel
  if (channel === "stdout" || channel === "all") {
    logInfo(formatStdout(report));
  }

  // email channel
  if (channel === "email" || channel === "all") {
    const severity = report.summary.failed > 0 ? "warn" : "info";
    const subject = `Nightly report: ${report.summary.passed}/${report.summary.total} passed`;

    if (dryRun) {
      logInfo(`[notify] [DRY RUN] Would send email: ${subject}`);
    } else {
      const result = sendNotification({
        subject,
        body: formatEmailBody(report),
        severity,
      });
      if (result.sent) {
        logInfo("[notify] Email sent ✅");
      } else {
        logInfo(`[notify] Email not sent: ${result.reason}`);
      }
    }
  }

  logInfo("\n[notify] done");
  process.exit(0);
}
