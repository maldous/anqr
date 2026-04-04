// Generated from ../../../scripts/ops/core/symphony-validation.mjs:191

import { VALIDATION_MANIFEST } from "./validation-manifest.mjs";
import { filterChangedFiles } from "./filter-changed-files.mjs";
import { runCommand } from "./run-command.mjs";

export async function runCspell(projectRoot, changedFiles = [], opts = {}) {
  const eligible = filterChangedFiles(changedFiles, VALIDATION_MANIFEST.cspell.extensions);
  const targets = opts.fullProject
    ? VALIDATION_MANIFEST.cspell.fullProjectGlobs
    : eligible.map((file) => JSON.stringify(file));
  if (targets.length === 0) return { pass: true, detail: "" };
  const result = await runCommand(`${VALIDATION_MANIFEST.cspell.command} ${targets.join(" ")}`, {
    cwd: projectRoot,
    timeout: VALIDATION_MANIFEST.cspell.timeoutMs,
    heartbeat: opts.heartbeat,
  });
  if (result.heartbeatFailed)
    return { pass: false, detail: "Heartbeat failed during cspell", heartbeatFailed: true };
  return result.ok ? { pass: true, detail: "" } : { pass: false, detail: result.output };
}
