// Generated from ../../../scripts/ops/reporting/harness-report.mjs:160

import { checkNpmScript } from "./check-npm-script.mjs";

export function checkTypecheck() {
  return checkNpmScript("typecheck", "tsc --noEmit");
}
