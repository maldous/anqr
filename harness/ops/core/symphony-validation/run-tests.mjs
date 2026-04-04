// Generated from ../../../scripts/ops/core/symphony-validation.mjs:227

import { VALIDATION_MANIFEST } from "./validation-manifest.mjs";
import { runCommand } from "./run-command.mjs";

export async function runTests(projectRoot, opts = {}) {
  const result = await runCommand(VALIDATION_MANIFEST.tests.command, {
    cwd: projectRoot,
    timeout: VALIDATION_MANIFEST.tests.timeoutMs,
    env: { ...process.env, ANQR_LOG_LEVEL: "error" },
    heartbeat: opts.heartbeat,
  });
  if (result.heartbeatFailed)
    return { pass: false, detail: "Heartbeat failed during tests", heartbeatFailed: true };
  return result.ok ? { pass: true, detail: "" } : { pass: false, detail: result.output };
}
