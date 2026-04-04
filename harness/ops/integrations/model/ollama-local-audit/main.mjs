import { OLLAMA_BASE } from "./ollama-base.mjs";
import { PINNED_MODEL } from "./pinned-model.mjs";
import { checkModelAvailable } from "./check-model-available.mjs";
import { checkModelResponds } from "./check-model-responds.mjs";
import { checkReachable } from "./check-reachable.mjs";
import { printSummary } from "./print-summary.mjs";
import { results } from "./results.mjs";
import { logInfo } from "./logger.mjs";

export async function main() {
  logInfo(`Checking ${PINNED_MODEL} at ${OLLAMA_BASE}\n`);

  const reachable = await checkReachable();
  if (!reachable) {
    printSummary();
    process.exit(1);
  }

  const available = await checkModelAvailable();
  if (!available) {
    printSummary();
    process.exit(1);
  }

  await checkModelResponds();
  printSummary();

  const allPassed = results.every((r) => r.pass);
  process.exit(allPassed ? 0 : 1);
}
