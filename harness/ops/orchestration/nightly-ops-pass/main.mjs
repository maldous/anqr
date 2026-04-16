import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { archiveReport } from "./archive-report.mjs";
import { dryRun } from "./dry-run.mjs";
import { dryRunFlag } from "./dry-run-flag.mjs";
import { printSummary } from "./print-summary.mjs";
import { runStep } from "./run-step.mjs";
import { skipSonar } from "./skip-sonar.mjs";
import { skipTests } from "./skip-tests.mjs";
import { steps } from "./steps.mjs";
import { logInfo } from "./logger.mjs";
import { ROOT } from "./root.mjs";
import { setGlobalValue } from "../../symphony-state.mjs";

export async function main() {
  logInfo(`[nightly]${dryRun ? " (DRY RUN)" : ""} starting at ${new Date().toISOString()}`);

  // Sonar requires coverage/lcov.info — auto-skip when tests are skipped and no
  // pre-existing coverage file is available, since sonar-scan would hard-fail.
  const hasCoverage = existsSync(resolve(ROOT, "coverage/lcov.info"));
  const sonarEnabled = Boolean(process.env.SONAR_TOKEN) && !skipSonar && (hasCoverage || !skipTests);
  if (process.env.SONAR_TOKEN && !skipSonar && !sonarEnabled) {
    logInfo("[nightly] ⚠️ Sonar steps skipped: --skip-tests is set and coverage/lcov.info is missing");
  }

  const plan = [
    {
      name: "worktree-prune",
      command: "git worktree prune",
      severity: "advisory",
    },
    {
      name: "worktree-repair",
      command: "git worktree repair",
      severity: "advisory",
    },
    {
      name: "harness-report",
      command: "node harness/ops/harness-report.mjs full",
      severity: "advisory",
    },
    {
      name: "ast-density",
      command:
        'bash -c \'output=$(node harness/audit-ast-density.mjs --threshold 1); if [ -n "$output" ]; then echo "$output"; exit 1; fi\'',
      severity: "advisory",
    },
    ...(skipTests
      ? []
      : [
          {
            name: "test-unit-coverage",
            command: "npm run test:unit:coverage",
            severity: "blocking",
            timeout: 400_000,
          },
        ]),
    ...(sonarEnabled
      ? [
          {
            name: "sonar-cleanup",
            command: "rm -rf .scannerwork",
            severity: "advisory",
          },
          {
            name: "sonar-scan",
            command:
              "test -f coverage/lcov.info || { echo 'ERROR: coverage/lcov.info missing'; exit 1; } && NODE_OPTIONS='' SONAR_SCANNER_OPTS='-Xms128m -Xmx256m' sonar-scanner",
            severity: "blocking",
            timeout: 600_000,
          },
          { name: "sonar-export", command: "bash harness/sonar-export.sh", severity: "blocking" },
          ...(dryRun
            ? []
            : [
                {
                  name: "sonar-linear-audit",
                  command: "node harness/ops/sonar-linear-audit.mjs",
                  severity: "blocking",
                },
              ]),
        ]
      : []),
    {
      name: "issue-hygiene",
      command: `node harness/ops/integrations/linear/issue-hygiene.mjs${dryRunFlag}`,
      severity: "independent",
    },
    {
      name: "queue-control",
      command: `node harness/ops/symphony-queue-control.mjs --all${dryRunFlag}`,
      severity: "independent",
    },
    {
      name: "guardian",
      command: `node harness/ops/linear-guardian.mjs${dryRunFlag}`,
      severity: "independent",
    },
    {
      name: "notify",
      command: `node harness/ops/notify.mjs --channel=all${dryRunFlag}`,
      severity: "independent",
    },
    {
      name: "latency-report",
      command: `node harness/ops/orchestration/latency-report.mjs --alert`,
      severity: "advisory",
    },
  ];

  let hardFailure = false;
  for (const step of plan) {
    if (hardFailure && step.severity === "blocking") {
      logInfo(`[nightly] Skipping ${step.name} because an earlier blocking step failed`);
      steps.push({
        name: step.name,
        exitCode: 99,
        duration_ms: 0,
        severity: step.severity,
        skipped: true,
      });
      continue;
    }
    const result = runStep(step);
    if (result.exitCode !== 0 && step.severity === "blocking") {
      hardFailure = true;
    }
  }

  if (sonarEnabled) {
    try {
      setGlobalValue("lastNightlySonarRun", {
        timestamp: new Date().toISOString(),
        skipSonar,
        dryRun,
      });
    } catch {
      /* best-effort */
    }
  }

  archiveReport();
  printSummary();

  // Exit 0 for operational success even if advisory/independent steps found quality issues.
  // Only exit 1 for blocking step failures (operational/correctness failures).
  process.exit(hardFailure ? 1 : 0);
}
