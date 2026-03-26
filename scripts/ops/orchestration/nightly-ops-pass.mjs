#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, copyFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createLogger } from "../lib/logger.mjs";

const { logInfo, logError } = createLogger();

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(__dirname, "..", "..", "..");
const REPORTS_DIR = resolve(ROOT, "reports");
const LATEST_REPORT = resolve(REPORTS_DIR, "latest.json");
const dryRun = process.argv.includes("--dry-run");
const dryRunFlag = dryRun ? " --dry-run" : "";
const steps = [];

function runStep(step) {
  const start = Date.now();
  logInfo(`\n${"=".repeat(60)}`);
  logInfo(`[nightly] Step: ${step.name}`);
  logInfo(`[nightly] Command: ${step.command}`);
  logInfo("=".repeat(60) + "\n");

  let exitCode = 0;
  const skipped = false;
  try {
    execFileSync("/bin/sh", ["-c", step.command], {
      cwd: ROOT,
      stdio: "inherit",
      timeout: step.timeout || 300_000,
      env: { ...process.env, FORCE_COLOR: "0" },
    });
  } catch (err) {
    exitCode = err.status || 1;
  }
  const result = {
    name: step.name,
    exitCode,
    duration_ms: Date.now() - start,
    severity: step.severity,
    skipped,
  };
  steps.push(result);
  logInfo(`\n${exitCode === 0 ? "✅" : "⚠️"} [nightly] ${step.name}: exit=${exitCode}`);
  return result;
}

function archiveReport() {
  if (!existsSync(LATEST_REPORT)) return;
  const archiveDir = resolve(REPORTS_DIR, "archive");
  if (!existsSync(archiveDir)) mkdirSync(archiveDir, { recursive: true });
  const ts = new Date().toISOString().replaceAll(/[:.]/g, "-").replaceAll("T", "_").slice(0, 19);
  const archivePath = resolve(archiveDir, `report-${ts}.json`);
  copyFileSync(LATEST_REPORT, archivePath);
  logInfo(`[nightly] Report archived to ${archivePath}`);
}

function printSummary() {
  logInfo(`\n${"=".repeat(60)}`);
  logInfo("[nightly] Pipeline summary");
  logInfo("=".repeat(60));
  for (const step of steps) {
    logInfo(
      `  ${step.exitCode === 0 ? "✅" : "⚠️"} ${step.name}: exit=${step.exitCode} (${(step.duration_ms / 1000).toFixed(1)}s) [${step.severity}]`,
    );
  }
}

async function main() {
  logInfo(`[nightly]${dryRun ? " (DRY RUN)" : ""} starting at ${new Date().toISOString()}`);
  const plan = [
    {
      name: "harness-report",
      command: "node scripts/ops/harness-report.mjs full",
      severity: "advisory",
    },
    {
      name: "ast-density",
      command:
        'bash -c \'output=$(node scripts/audit-ast-density.mjs --threshold 1); if [ -n "$output" ]; then echo "$output"; exit 1; fi\'',
      severity: "advisory",
    },
    {
      name: "test-unit-coverage",
      command: "npm run test:unit:coverage",
      severity: "blocking",
      timeout: 400_000,
    },
    ...(process.env.SONAR_TOKEN
      ? [
          {
            name: "sonar-scan",
            command:
              "test -f coverage/lcov.info || { echo 'ERROR: coverage/lcov.info missing'; exit 1; } && NODE_OPTIONS='' SONAR_SCANNER_OPTS='-Xms128m -Xmx256m' sonar-scanner",
            severity: "blocking",
            timeout: 600_000,
          },
          { name: "sonar-export", command: "bash scripts/sonar-export.sh", severity: "blocking" },
          ...(dryRun
            ? []
            : [
                {
                  name: "sonar-linear-audit",
                  command: "node scripts/ops/sonar-linear-audit.mjs",
                  severity: "blocking",
                },
              ]),
        ]
      : []),
    {
      name: "queue-control",
      command: `node scripts/ops/symphony-queue-control.mjs --all${dryRunFlag}`,
      severity: "independent",
    },
    {
      name: "guardian",
      command: `node scripts/ops/linear-guardian.mjs${dryRunFlag}`,
      severity: "independent",
    },
    {
      name: "notify",
      command: `node scripts/ops/notify.mjs --channel=all${dryRunFlag}`,
      severity: "independent",
    },
  ];

  let hardFailure = false;
  let degraded = false;
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
    if (result.exitCode !== 0) {
      if (step.severity === "blocking") {
        hardFailure = true;
        degraded = true;
      } else if (step.severity === "advisory") {
        degraded = true;
      }
    }
  }

  archiveReport();
  printSummary();
  process.exit(hardFailure || degraded ? 1 : 0);
}

try {
  await main();
} catch (err) {
  logError(`[nightly] Fatal: ${err.message}`);
  process.exit(1);
}
