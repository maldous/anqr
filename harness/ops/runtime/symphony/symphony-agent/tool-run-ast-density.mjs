import { runAstDensity } from "../../../symphony-validation.mjs";

export async function toolRunAstDensity(projectRoot, changedFiles) {
  const result = await runAstDensity(projectRoot, changedFiles);
  return result.pass ? "AST density passed — no violations." : result.detail;
}
