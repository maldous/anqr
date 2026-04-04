// Generated from ../../../../scripts/ops/integrations/linear/issue-hygiene.mjs:38

import { DEFAULT_COMMENT_THRESHOLD } from "./default-comment-threshold.mjs";

export function parseArgs() {
  const dryRun = process.argv.includes("--dry-run");
  const thresholdArg = process.argv.find((arg) => arg.startsWith("--threshold="));
  const threshold = thresholdArg
    ? Number.parseInt(thresholdArg.split("=")[1], 10)
    : DEFAULT_COMMENT_THRESHOLD;

  return { dryRun, threshold };
}
