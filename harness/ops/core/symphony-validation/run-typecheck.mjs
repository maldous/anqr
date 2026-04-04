// Generated from ../../../scripts/ops/core/symphony-validation.mjs:159

import { VALIDATION_MANIFEST } from "./validation-manifest.mjs";
import { runCommand } from "./run-command.mjs";

export async function runTypecheck(projectRoot, opts = {}) {
  const result = await runCommand(VALIDATION_MANIFEST.typecheck.command, {
    cwd: projectRoot,
    timeout: VALIDATION_MANIFEST.typecheck.timeoutMs,
    env: { ...process.env, NODE_OPTIONS: "--max-old-space-size=2048" },
    heartbeat: opts.heartbeat,
  });
  if (result.heartbeatFailed)
    return { pass: false, detail: "Heartbeat failed during typecheck", heartbeatFailed: true };
  return result.ok ? { pass: true, detail: "" } : { pass: false, detail: result.output };
}
