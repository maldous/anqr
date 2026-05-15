import { VALIDATION_MANIFEST } from "./validation-manifest.mjs";
import { runCommand } from "./run-command.mjs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

export async function runTests(projectRoot, opts = {}) {
  const testStateDir = mkdtempSync(path.join(tmpdir(), "anqr-validation-tests-"));
  const result = await runCommand(VALIDATION_MANIFEST.tests.command, {
    cwd: projectRoot,
    timeout: VALIDATION_MANIFEST.tests.timeoutMs,
    env: {
      ...process.env,
      ANQR_LOG_LEVEL: "error",
      ANQR_SYMPHONY_STATE_DIR: testStateDir,
      BRIDGE_MODE: "control-plane",
      ANQR_WORKTREE_ID: "",
      ANQR_WORKTREE_PATH: "",
    },
    heartbeat: opts.heartbeat,
  });
  if (result.heartbeatFailed)
    return {
      pass: false,
      detail: "Heartbeat failed during tests",
      heartbeatFailed: true,
      heartbeatDetail: result.heartbeatDetail,
    };
  return result.ok ? { pass: true, detail: "" } : { pass: false, detail: result.output };
}
