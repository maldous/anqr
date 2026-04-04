import { results } from "./results.mjs";
import { logInfo } from "./logger.mjs";

export function printSummary() {
  const passed = results.filter((r) => r.pass).length;
  const total = results.length;
  logInfo(`\n${passed}/${total} checks passed`);
}
