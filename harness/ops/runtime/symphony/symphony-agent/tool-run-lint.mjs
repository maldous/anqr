// Generated from ../../../../scripts/ops/runtime/symphony/symphony-agent.mjs:369

import { runLint } from "../../../symphony-validation.mjs";

export function toolRunLint(projectRoot) {
  const result = runLint(projectRoot);
  return result.pass ? "Lint passed — no errors or warnings." : result.detail;
}
