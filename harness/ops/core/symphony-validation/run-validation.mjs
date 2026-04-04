import { runAstDensity } from "./run-ast-density.mjs";
import { runCspell } from "./run-cspell.mjs";
import { runLint } from "./run-lint.mjs";
import { runTests } from "./run-tests.mjs";
import { runTypecheck } from "./run-typecheck.mjs";

export async function runValidation(projectRoot, changedFiles = [], opts = {}) {
  const heartbeatOpts = opts.heartbeat ? { heartbeat: opts.heartbeat } : {};

  const results = [
    { check: "typecheck", ...(await runTypecheck(projectRoot, heartbeatOpts)) },
    { check: "lint", ...(await runLint(projectRoot, heartbeatOpts)) },
    { check: "cspell", ...(await runCspell(projectRoot, changedFiles, heartbeatOpts)) },
    { check: "ast-density", ...(await runAstDensity(projectRoot, changedFiles, heartbeatOpts)) },
    { check: "test-unit", ...(await runTests(projectRoot, heartbeatOpts)) },
  ];

  // Check if any validation failed due to heartbeat failure
  const heartbeatFailed = results.some((r) => r.heartbeatFailed);

  return {
    passed: results.every((r) => r.pass),
    results,
    heartbeatFailed,
    signature: results
      .filter((r) => !r.pass)
      .map((r) => `${r.check}:${String(r.detail || "").split("\n")[0]}`)
      .join("|"),
  };
}
