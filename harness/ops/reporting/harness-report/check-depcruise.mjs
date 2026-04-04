// Generated from ../../../scripts/ops/reporting/harness-report.mjs:174

import { checkNpmScript } from "./check-npm-script.mjs";

export function checkDepcruise() {
  return checkNpmScript("depcruise", "dependency-cruiser");
}
