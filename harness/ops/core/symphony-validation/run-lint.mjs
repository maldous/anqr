import { VALIDATION_MANIFEST } from "./validation-manifest.mjs";
import { runCommand } from "./run-command.mjs";

export async function runLint(projectRoot, opts = {}) {
  const result = await runCommand(VALIDATION_MANIFEST.lint.command, {
    cwd: projectRoot,
    timeout: VALIDATION_MANIFEST.lint.timeoutMs,
    heartbeat: opts.heartbeat,
  });
  if (result.heartbeatFailed)
    return {
      pass: false,
      detail: "Heartbeat failed during lint",
      heartbeatFailed: true,
      heartbeatDetail: result.heartbeatDetail,
    };
  if (!result.ok) return { pass: false, detail: result.output };
  const warningMatch = result.output.match(/Found (\d+) warning/);
  const warnings = warningMatch ? Number(warningMatch[1]) : 0;
  return warnings > 0
    ? { pass: false, detail: result.output || "Lint warnings found." }
    : { pass: true, detail: "" };
}
