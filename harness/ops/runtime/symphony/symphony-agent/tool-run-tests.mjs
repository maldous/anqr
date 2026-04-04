// Generated from ../../../../scripts/ops/runtime/symphony/symphony-agent.mjs:374

import { runTests } from "../../../symphony-validation.mjs";

export function toolRunTests(projectRoot) {
  const result = runTests(projectRoot);
  return result.pass ? "Unit tests passed." : result.detail;
}
