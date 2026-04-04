import { runLint } from "../../../symphony-validation.mjs";

export function toolRunLint(projectRoot) {
  const result = runLint(projectRoot);
  return result.pass ? "Lint passed — no errors or warnings." : result.detail;
}
