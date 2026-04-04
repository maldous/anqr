import { VALIDATION_MANIFEST } from "./validation-manifest.mjs";
import { filterChangedFiles } from "./filter-changed-files.mjs";
import { runCommand } from "./run-command.mjs";

export async function runAstDensity(projectRoot, changedFiles = [], opts = {}) {
  const eligible = filterChangedFiles(changedFiles, VALIDATION_MANIFEST.astDensity.extensions);
  const quoted = opts.fullProject ? "" : eligible.map((file) => JSON.stringify(file)).join(" ");
  if (!opts.fullProject && eligible.length === 0) return { pass: true, detail: "" };
  const result = await runCommand(
    [VALIDATION_MANIFEST.astDensity.command, quoted].filter(Boolean).join(" "),
    {
      cwd: projectRoot,
      timeout: VALIDATION_MANIFEST.astDensity.timeoutMs,
      heartbeat: opts.heartbeat,
    },
  );
  if (result.heartbeatFailed)
    return { pass: false, detail: "Heartbeat failed during ast-density", heartbeatFailed: true, heartbeatDetail: result.heartbeatDetail };
  if (!result.ok) return { pass: false, detail: result.output };
  return result.output.trim().length > 0
    ? { pass: false, detail: result.output }
    : { pass: true, detail: "" };
}
