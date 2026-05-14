import { runAstDensity } from "./run-ast-density.mjs";
import { runLint } from "./run-lint.mjs";
import { runTypecheck } from "./run-typecheck.mjs";

export async function runGlobalPreflights(projectRoot, opts = {}) {
  const heartbeatOpts = opts.heartbeat ? { heartbeat: opts.heartbeat } : {};

  const tc = await runTypecheck(projectRoot, heartbeatOpts);
  if (!tc.pass) return { pass: false, check: "typecheck", detail: tc.detail };
  const lint = await runLint(projectRoot, heartbeatOpts);
  if (!lint.pass) return { pass: false, check: "lint", detail: lint.detail };
  const astDensity = await runAstDensity(projectRoot, [], { fullProject: true, ...heartbeatOpts });
  if (!astDensity.pass) return { pass: false, check: "ast-density", detail: astDensity.detail };
  return { pass: true };
}
