// Generated from ../../../../scripts/ops/runtime/symphony/symphony-agent.mjs:364

import { runCspell } from "../../../symphony-validation.mjs";

export function toolRunCspell(projectRoot, changedFiles) {
  const result = runCspell(projectRoot, changedFiles);
  return result.pass ? "Spell check passed — no issues." : result.detail;
}
