import { runAstDensity } from "../../../symphony-validation.mjs";

export function toolRunAstDensity(projectRoot, changedFiles) {
  const result = runAstDensity(projectRoot, changedFiles);
  return result.pass ? "AST density passed — no violations." : result.detail;
}
