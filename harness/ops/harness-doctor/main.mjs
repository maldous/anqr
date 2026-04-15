import { resolve } from "node:path";

import { ROOT } from "./root.mjs";
import { checkCreditGate } from "./check-credit-gate.mjs";
import { checkEnvVars } from "./check-env-vars.mjs";
import { checkEnvDrift } from "./check-env-drift.mjs";
import { checkHarnessConfig } from "./check-harness-config.mjs";
import { checkNodeModules } from "./check-node-modules.mjs";
import { checkOllama } from "./check-ollama.mjs";
import { checkQueueState } from "./check-queue-state.mjs";
import { checkReportsDir } from "./check-reports-dir.mjs";
import { checkSystemdServices } from "./check-systemd-services.mjs";
import { logInfo } from "./logger.mjs";

export async function main() {
  logInfo("[harness-doctor] Running harness diagnostics...\n");

  const categories = [
    { name: "Environment Variables", fn: checkEnvVars },
    { name: "Node Modules", fn: checkNodeModules },
    { name: "Harness Config Files", fn: checkHarnessConfig },
    { name: "Env File Drift", fn: checkEnvDrift },
    { name: "Credit Gate Provider", fn: checkCreditGate },
    { name: "Ollama Runtime", fn: checkOllama },
    { name: "Systemd Services", fn: checkSystemdServices },
    { name: "Queue State", fn: checkQueueState },
    { name: "Reports History", fn: checkReportsDir },
  ];

  const results = [];

  for (const cat of categories) {
    const start = Date.now();
    let result;
    try {
      result = await cat.fn();
    } catch (err) {
      result = { pass: false, detail: `Error: ${err.message}` };
    }
    const duration_ms = Date.now() - start;

    const icon = result.pass ? "✅" : "❌";
    logInfo(`${icon} ${cat.name}: ${result.detail}`);

    results.push({
      category: cat.name,
      pass: result.pass,
      detail: result.detail,
      duration_ms,
      data: result,
    });
  }

  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;
  const total = results.length;

  logInfo(`\n[harness-doctor] ${passed}/${total} categories passed, ${failed} failed`);

  // Write detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: { passed, failed, total },
    results,
  };

  const reportPath = resolve(ROOT, "reports", "doctor.json");
  const { writeFileSync } = await import("node:fs");
  writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");
  logInfo(`[harness-doctor] Report written to reports/doctor.json`);

  process.exit(failed > 0 ? 1 : 0);
}
