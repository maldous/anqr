// Generated from ../../../scripts/ops/reporting/harness-report.mjs:558

import { CHECKS } from "./checks.mjs";

export async function runCheck(name) {
  const check = CHECKS[name];
  if (!check) {
    return { name, pass: false, detail: `Unknown check: ${name}`, duration_ms: 0 };
  }

  const start = Date.now();
  const result = check.async ? await check.fn() : check.fn();
  const duration_ms = Date.now() - start;

  return {
    name,
    pass: result.pass,
    detail: result.detail,
    duration_ms,
  };
}
