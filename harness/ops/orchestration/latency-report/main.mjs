// Generated from ../../../scripts/ops/orchestration/latency-report.mjs:159

import { generateReport } from "./generate-report.mjs";
import { logError } from "./logger.mjs";

export async function main() {
  const args = new Set(process.argv.slice(2));
  const sendAlert = args.has("--alert");

  try {
    const result = await generateReport({ sendAlert });
    process.exit(result.alert ? 1 : 0);
  } catch (err) {
    logError(`[latency-report] Fatal error: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }
}
