// Generated from ../../../scripts/ops/orchestration/symphony-runner.mjs:376

import { unlinkSync } from "node:fs";

export function removeTempFile(filePath) {
  if (!filePath) return;
  try {
    unlinkSync(filePath);
  } catch {}
}
