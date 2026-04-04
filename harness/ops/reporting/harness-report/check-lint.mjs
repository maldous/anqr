// Generated from ../../../scripts/ops/reporting/harness-report.mjs:164

import { checkNpmScript } from "./check-npm-script.mjs";

export function checkLint() {
  return checkNpmScript("lint", "oxlint");
}
