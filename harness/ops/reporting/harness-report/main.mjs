import { resolve } from "node:path";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

import { PROFILES } from "./profiles.mjs";
import { ROOT } from "./root.mjs";
import { runCheck } from "./run-check.mjs";
import { logInfo, logError } from "./logger.mjs";

export async function main() {
  const profile = process.argv[2] || "quick";

  if (!PROFILES[profile]) {
    logError(`Unknown profile: ${profile}`);
    logError(`Available profiles: ${Object.keys(PROFILES).join(", ")}`);
    process.exit(2);
  }

  const checkNames = PROFILES[profile];
  logInfo(`[harness-report] profile=${profile} checks=${checkNames.length}\n`);

  const results = [];
  for (const name of checkNames) {
    const result = await runCheck(name);
    const icon = result.pass ? "✅" : "❌";
    const timing =
      result.duration_ms > 1000
        ? `${(result.duration_ms / 1000).toFixed(1)}s`
        : `${result.duration_ms}ms`;
    logInfo(`${icon} ${result.name} (${timing}): ${result.detail}`);
    results.push(result);
  }

  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;
  const total = results.length;
  const total_duration_ms = results.reduce((sum, r) => sum + r.duration_ms, 0);

  const report = {
    profile,
    timestamp: new Date().toISOString(),
    total_duration_ms,
    summary: { passed, failed, total },
    checks: results,
  };

  const reportsDir = resolve(ROOT, "reports");
  if (!existsSync(reportsDir)) {
    mkdirSync(reportsDir, { recursive: true });
  }

  const reportPath = resolve(reportsDir, "latest.json");
  writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");

  logInfo(
    `\n[harness-report] ${passed}/${total} passed, ${failed} failed (${(total_duration_ms / 1000).toFixed(1)}s)`,
  );
  logInfo(`[harness-report] report written to reports/latest.json`);

  process.exit(failed > 0 ? 1 : 0);
}
